#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

// Properly typed exec function
const execAsync = promisify(exec);

class ClaudeGeminiMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'claude-gemini-pair-programmer',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.workingDirectory = process.cwd();
        this.sessionContext = {
            currentFile: null,
            lastClaudeOutput: null,
            lastGeminiFeedback: null,
            iterationCount: 0
        };

        this.setupToolHandlers();
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'claude_implement',
                    description: 'Execute Claude CLI to implement or modify Pine Script code',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'The implementation prompt for Claude CLI'
                            },
                            file_path: {
                                type: 'string',
                                description: 'Path to the Pine Script file to work on'
                            }
                        },
                        required: ['prompt']
                    }
                },
                {
                    name: 'gemini_code_review',
                    description: 'Execute Gemini CLI to review and provide feedback on Pine Script code',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            file_path: {
                                type: 'string',
                                description: 'Path to the Pine Script file to review'
                            },
                            context: {
                                type: 'string',
                                description: 'Additional context about what was implemented'
                            }
                        },
                        required: ['file_path']
                    }
                },
                {
                    name: 'pair_programming_cycle',
                    description: 'Execute a full pair programming cycle: Claude implements, Gemini reviews, iterate',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            initial_prompt: {
                                type: 'string',
                                description: 'Initial requirement or problem to solve'
                            },
                            file_path: {
                                type: 'string',
                                description: 'Path to the Pine Script file'
                            },
                            max_iterations: {
                                type: 'number',
                                description: 'Maximum number of iterations (default: 3)',
                                default: 3
                            }
                        },
                        required: ['initial_prompt']  // Only initial_prompt is required
                    }
                },
                {
                    name: 'get_session_context',
                    description: 'Get current session context and history',
                    inputSchema: {
                        type: 'object',
                        properties: {}
                    }
                }
            ]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'claude_implement':
                        return await this.claudeCodeImplement(args.prompt, args.file_path);

                    case 'gemini_code_review':
                        return await this.geminiCodeReview(args.file_path, args.context);

                    case 'pair_programming_cycle':
                        return await this.pairProgrammingCycle(
                            args.initial_prompt,
                            args.file_path,
                            args.max_iterations || 3
                        );

                    case 'get_session_context':
                        return await this.getSessionContext();

                    default:
                        new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`
                        }
                    ]
                };
            }
        });
    }

    async claudeCodeImplement(prompt, filePath) {
        try {
            const fullPrompt = filePath ?
                `${prompt} (working on file: ${filePath})` :
                prompt;

            const command = `claude "${fullPrompt}"`;
            const { stdout, stderr } = await execAsync(command, {
                cwd: this.workingDirectory,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });

            this.sessionContext.lastClaudeOutput = stdout;
            this.sessionContext.currentFile = filePath;

            return {
                content: [
                    {
                        type: 'text',
                        text: `Claude Code Implementation:\n\n${stdout}${stderr ? `\n\nErrors/Warnings:\n${stderr}` : ''}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Claude CLI error: ${error.message}`);
        }
    }

    async geminiCodeReview(filePath, context) {
        try {
            // Read the file content
            const fileContent = await fs.readFile(filePath, 'utf-8');

            // Create a comprehensive review prompt
            const reviewPrompt = `Review this Pine Script code for correctness, best practices, and potential issues:

File: ${filePath}
Context: ${context || 'Recent implementation by Claude Code CLI'}

Code:
\`\`\`pinescript
${fileContent}
\`\`\`

Please provide:
1. Code correctness analysis
2. Pine Script best practices compliance
3. Potential runtime issues
4. Performance considerations
5. Specific suggestions for improvement

Focus on actionable feedback that can be implemented.`;

            const command = `gemini "${reviewPrompt}"`;
            const { stdout, stderr } = await execAsync(command, {
                cwd: this.workingDirectory,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });

            this.sessionContext.lastGeminiFeedback = stdout;

            return {
                content: [
                    {
                        type: 'text',
                        text: `Gemini Code Review:\n\n${stdout}${stderr ? `\n\nErrors/Warnings:\n${stderr}` : ''}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Gemini CLI error: ${error.message}`);
        }
    }

    async pairProgrammingCycle(initialPrompt, filePath, maxIterations) {
        let results = [];
        let currentPrompt = initialPrompt;

        this.sessionContext.iterationCount = 0;
        this.sessionContext.currentFile = filePath;

        // If no file path provided, this is a general question
        if (!filePath) {
            results.push("=== GENERAL INQUIRY (NO FILE SPECIFIED) ===");
            results.push("\n🤔 CLAUDE - RESPONDING TO GENERAL QUESTION:");

            try {
                const claudeResult = await this.claudeCodeImplement(currentPrompt, null);
                results.push(claudeResult.content[0].text);

                results.push("\n🧭 GEMINI - PROVIDING ADDITIONAL PERSPECTIVE:");
                const geminiPrompt = `Provide additional insights or corrections to this response about: ${initialPrompt}

Claude's response:
${this.sessionContext.lastClaudeOutput}

Please add any missing information, corrections, or alternative perspectives.`;

                const command = `gemini "${geminiPrompt}"`;
                let result;
                try {
                    result = await execAsync(command, {
                        cwd: this.workingDirectory,
                        maxBuffer: 1024 * 1024 * 10,
                        timeout: 120000
                    });
                } catch (execError) {
                    const stdout = execError.stdout || '';
                    const stderr = execError.stderr || execError.message;
                    result = { stdout, stderr };
                }

                results.push(`Gemini Additional Insights:\n\n${result.stdout}${result.stderr ? `\n\nErrors/Warnings:\n${result.stderr}` : ''}`);

            } catch (error) {
                results.push(`Error during general inquiry: ${error.message}`);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `General Inquiry Complete:\n${results.join('\n')}`
                    }
                ]
            };
        }

        // Original file-based pair programming logic continues here...
        for (let i = 0; i < maxIterations; i++) {
            this.sessionContext.iterationCount = i + 1;

            results.push(`\n=== ITERATION ${i + 1} ===`);

            // Step 1: Claude implements
            results.push("\n🚗 CLAUDE (DRIVER) - IMPLEMENTING:");
            try {
                const claudeResult = await this.claudeCodeImplement(currentPrompt, filePath);
                results.push(claudeResult.content[0].text);
            } catch (error) {
                results.push(`Claude implementation failed: ${error.message}`);
                break;
            }

            // Step 2: Gemini reviews
            results.push("\n🧭 GEMINI (NAVIGATOR) - REVIEWING:");
            try {
                const geminiResult = await this.geminiCodeReview(filePath, currentPrompt);
                results.push(geminiResult.content[0].text);

                // Check if Gemini suggests the code is good enough
                if (geminiResult.content[0].text.toLowerCase().includes('looks good') ||
                    geminiResult.content[0].text.toLowerCase().includes('no issues')) {
                    results.push("\n✅ GEMINI APPROVAL - Code meets requirements!");
                    break;
                }

                // Prepare next iteration prompt based on Gemini's feedback
                currentPrompt = `Based on this feedback from code review, please improve the Pine Script code:

${this.sessionContext.lastGeminiFeedback}

Original requirement: ${initialPrompt}`;

            } catch (error) {
                results.push(`Gemini review failed: ${error.message}`);
                break;
            }
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `Pair Programming Session Complete:\n${results.join('\n')}`
                }
            ]
        };
    }

    async getSessionContext() {
        return {
            content: [
                {
                    type: 'text',
                    text: `Current Session Context:
- Working Directory: ${this.workingDirectory}
- Current File: ${this.sessionContext.currentFile || 'None'}
- Iteration Count: ${this.sessionContext.iterationCount}
- Last Claude Output: ${this.sessionContext.lastClaudeOutput ? 'Available' : 'None'}
- Last Gemini Feedback: ${this.sessionContext.lastGeminiFeedback ? 'Available' : 'None'}`
                }
            ]
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Claude-Gemini MCP Server running on stdio');
    }
}

const server = new ClaudeGeminiMCPServer();
server.run().catch(console.error);
