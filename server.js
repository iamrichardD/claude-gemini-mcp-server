#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class GeminiCodeReviewServer {
    constructor() {
        this.server = new Server(
            {
                name: 'gemini-code-reviewer',
                version: '2.0.8',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.workingDirectory = process.cwd();
        this.sessionContext = {
            lastReview: null,
            reviewHistory: []
        };

        this.geminiCLIValidated = false;
        this.geminiCLIValidationPromise = null;

        this.config = {
            maxFileSize: 1024 * 1024,
            maxPromptLength: 100000,
            commandTimeout: 60000,
            maxConcurrentRequests: 3,
            allowedFileExtensions: new Set([
                '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go',
                '.rs', '.kt', '.swift', '.pine', '.pinescript', '.sh', '.bash', '.ps1',
                '.sql', '.html', '.css', '.scss', '.sass', '.vue', '.jsx', '.tsx',
                '.dart', '.r', '.m', '.scala', '.clj', '.hs', '.ml', '.ex', '.erl',
                '.lua', '.pl', '.vim'
            ])
        };

        this.setupToolHandlers();
    }

    validateFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path: must be a non-empty string');
        }

        let resolvedPath;
        if (path.isAbsolute(filePath)) {
            resolvedPath = path.normalize(filePath);
        } else {
            resolvedPath = path.resolve(this.workingDirectory, filePath);
        }

        if (!path.isAbsolute(filePath) && !resolvedPath.startsWith(this.workingDirectory)) {
            throw new Error('Invalid file path: path traversal detected');
        }

        const ext = path.extname(resolvedPath).toLowerCase();
        if (!this.config.allowedFileExtensions.has(ext)) {
            throw new Error(`Unsupported file extension: ${ext}`);
        }

        return resolvedPath;
    }

    async validateFileAccess(filePath) {
        try {
            const stats = await fs.stat(filePath);

            if (!stats.isFile()) {
                throw new Error('Path is not a file');
            }

            if (stats.size > this.config.maxFileSize) {
                throw new Error(`File too large: ${stats.size} bytes (max: ${this.config.maxFileSize})`);
            }

            await fs.access(filePath, fs.constants.R_OK);

            const buffer = Buffer.alloc(512);
            const fileHandle = await fs.open(filePath, 'r');
            try {
                const { bytesRead } = await fileHandle.read(buffer, 0, 512, 0);
                const sample = buffer.subarray(0, bytesRead);

                const nullBytes = sample.filter(byte => byte === 0).length;
                const nonPrintable = sample.filter(byte => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13).length;

                if (nullBytes > 0 || nonPrintable > bytesRead * 0.3) {
                    throw new Error('File appears to be binary, not a text-based source code file');
                }
            } finally {
                await fileHandle.close();
            }

            return stats;
        } catch (error) {
            if (error.message.includes('File appears to be binary') ||
                error.message.includes('Path is not a file') ||
                error.message.includes('File too large')) {
                throw error;
            }

            const fileError = new Error(`File access error: ${error.message}`);
            fileError.cause = error;
            fileError.code = error.code;
            throw fileError;
        }
    }

    sanitizeInput(input, maxLength = this.config.maxPromptLength) {
        if (!input || typeof input !== 'string') {
            return '';
        }

        if (input.length > maxLength) {
            throw new Error(`Input too long: ${input.length} characters (max: ${maxLength})`);
        }

        return input
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/\r\n/g, '\n')
            .trim();
    }

    async validateGeminiCLI() {
        if (this.geminiCLIValidated) {
            return true;
        }

        if (this.geminiCLIValidationPromise) {
            return this.geminiCLIValidationPromise;
        }

        this.geminiCLIValidationPromise = this._performGeminiCLIValidation();

        try {
            await this.geminiCLIValidationPromise;
            this.geminiCLIValidated = true;
            this.geminiCLIValidationPromise = null;
            return true;
        } catch (error) {
            this.geminiCLIValidated = false;
            this.geminiCLIValidationPromise = null;
            throw error;
        }
    }

    async _performGeminiCLIValidation() {
        try {
            const child = spawn('gemini', ['--version'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 5000
            });

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    child.kill('SIGTERM');
                    reject(new Error('Gemini CLI validation timeout'));
                }, 5000);

                child.on('close', (code) => {
                    clearTimeout(timeoutId);
                    if (code === 0) {
                        resolve(true);
                    } else {
                        reject(new Error('Gemini CLI not available or not working'));
                    }
                });

                child.on('error', (error) => {
                    clearTimeout(timeoutId);
                    reject(new Error(`Gemini CLI not found: ${error.message}`));
                });
            });
        } catch (error) {
            throw new Error(`Gemini CLI validation failed: ${error.message}`);
        }
    }

    async executeGeminiCommand(prompt, timeoutMs = this.config.commandTimeout) {
        return new Promise((resolve, reject) => {
            const sanitizedPrompt = this.sanitizeInput(prompt);

            if (!sanitizedPrompt) {
                reject(new Error('Empty or invalid prompt after sanitization'));
                return;
            }

            const child = spawn('gemini', ['-p', sanitizedPrompt], {
                cwd: this.workingDirectory,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    PATH: process.env.PATH,
                    HOME: process.env.HOME,
                    TERM: 'dumb'
                }
            });

            let stdout = '';
            let stderr = '';
            let processFinished = false;
            let timeoutTriggered = false;

            const timeoutId = setTimeout(() => {
                if (!processFinished) {
                    timeoutTriggered = true;
                    child.kill('SIGTERM');
                    reject(new Error(`Command timeout after ${timeoutMs}ms`));
                }
            }, timeoutMs);

            child.stdout.on('data', (data) => {
                stdout += data.toString();
                if (stdout.length > this.config.maxFileSize * 2) {
                    if (!processFinished && !timeoutTriggered) {
                        processFinished = true;
                        clearTimeout(timeoutId);
                        child.kill('SIGTERM');
                        reject(new Error('Output too large, terminating process'));
                    }
                }
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (processFinished || timeoutTriggered) return;

                processFinished = true;
                clearTimeout(timeoutId);

                const hasOutput = stdout.trim().length > 0;
                const isSuccessCode = code === 0;

                if (isSuccessCode) {
                    resolve({
                        success: true,
                        output: stdout.trim(),
                        error: stderr.trim() || null,
                        hasOutput
                    });
                } else {
                    reject(new Error(`Gemini CLI failed with exit code ${code}: ${stderr || 'No error message'}`));
                }
            });

            child.on('error', (error) => {
                if (processFinished || timeoutTriggered) return;

                processFinished = true;
                clearTimeout(timeoutId);
                reject(new Error(`Failed to start Gemini CLI: ${error.message}`));
            });
        });
    }

    trackOperationResult(operation, filePath, success, error = null, additionalData = {}) {
        const result = {
            timestamp: new Date().toISOString(),
            operation,
            file: filePath ? (path.relative(this.workingDirectory, filePath) || path.basename(filePath)) : 'unknown',
            success,
            ...additionalData
        };

        if (error) {
            result.error = error;
        }

        this.sessionContext.reviewHistory.push(result);

        if (success) {
            this.sessionContext.lastReview = result;
        }

        return result;
    }

    getDisplayPath(filePath) {
        const relativePath = path.relative(this.workingDirectory, filePath);
        return relativePath.startsWith('..') ? path.basename(filePath) : relativePath;
    }

    handleOperationError(operation, filePath, originalError, additionalData = {}) {
        this.trackOperationResult(operation, filePath, false, originalError.message, additionalData);

        const operationName = operation.replace(/_/g, ' ');
        const consistentError = new Error(`${operationName} failed: ${originalError.message}`);

        consistentError.cause = originalError;
        consistentError.stack = originalError.stack;
        consistentError.code = originalError.code;
        consistentError.operation = operation;
        consistentError.filePath = filePath;

        throw consistentError;
    }

    parseActionableSuggestion(responseText) {
        const oldCodeRegex = /--- OLD_CODE ---\n([\s\S]*?)\n--- END_OLD_CODE ---/;
        const newCodeRegex = /--- NEW_CODE ---\n([\s\S]*?)\n--- END_NEW_CODE ---/;

        const oldCodeMatch = responseText.match(oldCodeRegex);
        const newCodeMatch = responseText.match(newCodeRegex);

        if (oldCodeMatch && oldCodeMatch[1] && newCodeMatch && newCodeMatch[1]) {
            const oldCode = oldCodeMatch[1];
            const newCode = newCodeMatch[1];

            // Remove the suggestion blocks from the main text to avoid redundancy
            const explanation = responseText
                .replace(oldCodeRegex, '')
                .replace(newCodeRegex, '')
                .trim();

            return {
                explanation,
                oldCode,
                newCode
            };
        }

        return null;
    }

    detectLanguage(filePath, providedLanguage) {
        if (providedLanguage) {
            return this.sanitizeInput(providedLanguage, 50);
        }

        const ext = path.extname(filePath).toLowerCase();
        const languageMap = {
            '.js': 'JavaScript', '.ts': 'TypeScript', '.py': 'Python', '.java': 'Java',
            '.cpp': 'C++', '.c': 'C', '.cs': 'C#', '.php': 'PHP', '.rb': 'Ruby',
            '.go': 'Go', '.rs': 'Rust', '.kt': 'Kotlin', '.swift': 'Swift',
            '.pine': 'Pine Script', '.pinescript': 'Pine Script', '.sh': 'Shell Script',
            '.bash': 'Bash', '.ps1': 'PowerShell', '.sql': 'SQL', '.html': 'HTML',
            '.css': 'CSS', '.scss': 'SCSS', '.sass': 'Sass', '.vue': 'Vue.js',
            '.jsx': 'React JSX', '.tsx': 'React TSX', '.dart': 'Dart', '.r': 'R',
            '.m': 'MATLAB', '.scala': 'Scala', '.clj': 'Clojure', '.hs': 'Haskell',
            '.ml': 'OCaml', '.ex': 'Elixir', '.erl': 'Erlang', '.lua': 'Lua',
            '.pl': 'Perl', '.vim': 'Vimscript'
        };

        return languageMap[ext] || 'Unknown';
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'gemini_code_review',
                    description: 'Use Gemini CLI to review code for correctness, best practices, and improvements',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            file_path: { type: 'string', description: 'Path to the source code file to review' },
                            context: { type: 'string', description: 'Additional context (max 1000 chars)', maxLength: 1000 },
                            focus_areas: { type: 'string', enum: ['syntax', 'logic', 'performance', 'best_practices', 'security', 'testing', 'general'], default: 'general' },
                            language: { type: 'string', description: 'Programming language (auto-detected if not specified)', maxLength: 50 }
                        },
                        required: ['file_path']
                    }
                },
                {
                    name: 'gemini_analyze_code',
                    description: 'Use Gemini CLI to analyze and explain code functionality',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            file_path: { type: 'string', description: 'Path to the source code file to analyze' },
                            analysis_type: { type: 'string', enum: ['explain', 'optimize', 'debug', 'refactor', 'compare'], default: 'explain' },
                            language: { type: 'string', description: 'Programming language (auto-detected if not specified)', maxLength: 50 }
                        },
                        required: ['file_path']
                    }
                },
                {
                    name: 'gemini_suggest_improvements',
                    description: 'Use Gemini CLI to suggest specific improvements for code',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            file_path: { type: 'string', description: 'Path to the source code file' },
                            improvement_goals: { type: 'string', enum: ['performance', 'readability', 'maintainability', 'scalability', 'security', 'general'], default: 'general' },
                            language: { type: 'string', description: 'Programming language (auto-detected if not specified)', maxLength: 50 }
                        },
                        required: ['file_path']
                    }
                },
                {
                    name: 'gemini_validate_architecture',
                    description: 'Use Gemini CLI to validate code architecture and design patterns',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            file_path: { type: 'string', description: 'Path to the source code file' },
                            validation_focus: { type: 'string', enum: ['architecture', 'design_patterns', 'scalability', 'testability', 'maintainability'], default: 'architecture' },
                            language: { type: 'string', description: 'Programming language (auto-detected if not specified)', maxLength: 50 }
                        },
                        required: ['file_path']
                    }
                },
                {
                    name: 'get_review_history',
                    description: 'Get the history of operations performed in this session',
                    inputSchema: { type: 'object', properties: {} }
                }
            ]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'gemini_code_review':
                        return await this.geminiCodeReview(args.file_path, args.context, args.focus_areas, args.language);
                    case 'gemini_analyze_code':
                        return await this.geminiAnalyzeCode(args.file_path, args.analysis_type, args.language);
                    case 'gemini_suggest_improvements':
                        return await this.geminiSuggestImprovements(args.file_path, args.improvement_goals, args.language);
                    case 'gemini_validate_architecture':
                        return await this.geminiValidateArchitecture(args.file_path, args.validation_focus, args.language);
                    case 'get_review_history':
                        return await this.getReviewHistory();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                console.error(`Tool execution error [${name}]:`, {
                    message: error.message,
                    operation: error.operation || name,
                    filePath: error.filePath || args.file_path,
                    stack: error.stack,
                    cause: error.cause?.message
                });

                return {
                    content: [{ type: 'text', text: `❌ **Error in ${name}**: ${error.message}\n\nPlease check your input parameters and try again.` }],
                    isError: true
                };
            }
        });
    }

    async geminiCodeReview(filePath, context, focusAreas = 'general', language = null) {
        try {
            await this.validateGeminiCLI();

            const validatedPath = this.validateFilePath(filePath);
            await this.validateFileAccess(validatedPath);

            const fileContent = await fs.readFile(validatedPath, 'utf-8');
            const detectedLanguage = this.detectLanguage(validatedPath, language);
            const sanitizedContext = this.sanitizeInput(context || 'General code review', 1000);
            const displayPath = this.getDisplayPath(validatedPath);

            const reviewPrompt = `Perform a comprehensive code review:

**File**: ${displayPath}
**Language**: ${detectedLanguage}
**Context**: ${sanitizedContext}
**Focus Areas**: ${focusAreas}

**Code to Review**:
\`\`\`${detectedLanguage.toLowerCase()}
${fileContent}
\`\`\`

**Instructions**:
Your primary goal is to provide a text-based review. However, if you find a specific, critical issue that can be fixed with a direct code replacement, you MAY provide ONE such suggestion. If you do, you MUST use the following EXACT format.

--- OLD_CODE ---
// The full, original code block to be replaced.
--- END_OLD_CODE ---

--- NEW_CODE ---
// The full, new, improved code block.
--- END_NEW_CODE ---

**Review Guidelines**:
1. **Issues Found**: List any problems with severity levels (Critical, High, Medium, Low).
2. **Suggestions**: Provide specific, actionable improvements. If you provided a code replacement above, explain the rationale for it here.
3. **Rating**: Give an overall code quality score (1-10).
4. **Priority Actions**: List the top 3 things to fix first.`;

            console.error(`Executing Gemini code review for: ${displayPath}`);

            const result = await this.executeGeminiCommand(reviewPrompt);

            const suggestion = this.parseActionableSuggestion(result.output);

            if (suggestion && suggestion.oldCode.trim() && suggestion.newCode.trim()) {
                this.trackOperationResult('code_review', validatedPath, true, null, {
                    language: detectedLanguage,
                    context: sanitizedContext,
                    focusAreas,
                    actionable: true
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `🧭 **Gemini Code Review - ${displayPath} (${detectedLanguage})**\n\n${suggestion.explanation}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                        },
                        {
                            type: 'tool_use',
                            name: 'replace',
                            arguments: {
                                file_path: validatedPath,
                                old_string: suggestion.oldCode,
                                new_string: suggestion.newCode
                            }
                        }
                    ]
                };
            }

            this.trackOperationResult('code_review', validatedPath, true, null, {
                language: detectedLanguage,
                context: sanitizedContext,
                focusAreas,
                actionable: false
            });

            return {
                content: [{
                    type: 'text',
                    text: `🧭 **Gemini Code Review - ${displayPath} (${detectedLanguage})**\n\n${result.output}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                }]
            };
        } catch (error) {
            this.handleOperationError('code_review', filePath, error, {
                language: language || 'unknown',
                context: context || 'none',
                focusAreas: focusAreas || 'general'
            });
        }
    }

    async geminiAnalyzeCode(filePath, analysisType = 'explain', language = null) {
        try {
            await this.validateGeminiCLI();

            const validatedPath = this.validateFilePath(filePath);
            await this.validateFileAccess(validatedPath);

            const fileContent = await fs.readFile(validatedPath, 'utf-8');
            const detectedLanguage = this.detectLanguage(validatedPath, language);
            const displayPath = this.getDisplayPath(validatedPath);

            const analysisPrompts = {
                explain: `Explain what this ${detectedLanguage} code does, how it works, and its purpose:`,
                optimize: `Analyze this ${detectedLanguage} code for optimization opportunities:`,
                debug: `Help debug this ${detectedLanguage} code by identifying potential issues:`,
                refactor: `Suggest refactoring improvements for this ${detectedLanguage} code:`,
                compare: `Analyze this ${detectedLanguage} code and suggest alternative approaches:`
            };

            const prompt = `${analysisPrompts[analysisType] || analysisPrompts.explain}

**File**: ${displayPath}
**Language**: ${detectedLanguage}

**Code**:
\`\`\`${detectedLanguage.toLowerCase()}
${fileContent}
\`\`\`

Provide a detailed analysis focusing on the ${analysisType} aspect.`;

            console.error(`Executing Gemini code analysis (${analysisType}) for: ${displayPath}`);

            const result = await this.executeGeminiCommand(prompt);

            this.trackOperationResult('code_analysis', validatedPath, true, null, {
                language: detectedLanguage,
                analysisType
            });

            return {
                content: [{
                    type: 'text',
                    text: `🔍 **Gemini Code Analysis (${analysisType}) - ${displayPath} (${detectedLanguage})**\n\n${result.output}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                }]
            };
        } catch (error) {
            this.handleOperationError('code_analysis', filePath, error, {
                language: language || 'unknown',
                analysisType
            });
        }
    }

    async geminiSuggestImprovements(filePath, improvementGoals = 'general', language = null) {
        try {
            await this.validateGeminiCLI();

            const validatedPath = this.validateFilePath(filePath);
            await this.validateFileAccess(validatedPath);

            const fileContent = await fs.readFile(validatedPath, 'utf-8');
            const detectedLanguage = this.detectLanguage(validatedPath, language);
            const displayPath = this.getDisplayPath(validatedPath);

            const prompt = `Suggest specific improvements for this ${detectedLanguage} code:

**File**: ${displayPath}
**Language**: ${detectedLanguage}
**Improvement Goals**: ${improvementGoals}

**Current Code**:
\`\`\`${detectedLanguage.toLowerCase()}
${fileContent}
\`\`\`

**Instructions**:
If you find a section of code to improve, you MUST provide the complete, original code block to be replaced and the complete, new code block to replace it with. Use the following EXACT format. Do not add any other text or explanation inside the code blocks.

--- OLD_CODE ---
// The full, original code block to be replaced, including all original indentation and newlines.
--- END_OLD_CODE ---

--- NEW_CODE ---
// The full, new, improved code block, including all necessary indentation and newlines.
--- END_NEW_CODE ---

**Rationale**:
After the code blocks, provide a clear explanation of why the improvement is necessary and what it does. Focus on the specified goals: ${improvementGoals}.`;

            console.error(`Executing Gemini improvement suggestions for: ${displayPath}`);

            const result = await this.executeGeminiCommand(prompt);

            const suggestion = this.parseActionableSuggestion(result.output);

            if (suggestion && suggestion.oldCode.trim() && suggestion.newCode.trim()) {
                this.trackOperationResult('suggest_improvements', validatedPath, true, null, {
                    language: detectedLanguage,
                    improvementGoals,
                    actionable: true
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: `💡 **Gemini Improvement Suggestion - ${displayPath} (${detectedLanguage})**\n\n${suggestion.explanation}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                        },
                        {
                            type: 'tool_use',
                            name: 'replace',
                            arguments: {
                                file_path: validatedPath,
                                old_string: suggestion.oldCode,
                                new_string: suggestion.newCode
                            }
                        }
                    ]
                };
            }

            this.trackOperationResult('suggest_improvements', validatedPath, true, null, {
                language: detectedLanguage,
                improvementGoals,
                actionable: false
            });

            return {
                content: [{
                    type: 'text',
                    text: `💡 **Gemini Improvement Suggestions - ${displayPath} (${detectedLanguage})**\n\n${result.output}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                }]
            };
        } catch (error) {
            this.handleOperationError('suggest_improvements', filePath, error, {
                language: language || 'unknown',
                improvementGoals
            });
        }
    }

    async geminiValidateArchitecture(filePath, validationFocus = 'architecture', language = null) {
        try {
            await this.validateGeminiCLI();

            const validatedPath = this.validateFilePath(filePath);
            await this.validateFileAccess(validatedPath);

            const fileContent = await fs.readFile(validatedPath, 'utf-8');
            const detectedLanguage = this.detectLanguage(validatedPath, language);
            const displayPath = this.getDisplayPath(validatedPath);

            const prompt = `Validate this ${detectedLanguage} code architecture and design:

**File**: ${displayPath}
**Language**: ${detectedLanguage}
**Validation Focus**: ${validationFocus}

**Code**:
\`\`\`${detectedLanguage.toLowerCase()}
${fileContent}
\`\`\`

**Validation Checklist**:
1. **Architecture**: Is the overall structure sound and scalable?
2. **Design Patterns**: Are appropriate patterns used correctly?
3. **Separation of Concerns**: Are responsibilities properly separated?
4. **SOLID Principles**: Does the code follow SOLID principles?
5. **Modularity**: Is the code properly modularized and reusable?
6. **Error Handling**: Is error handling comprehensive and appropriate?
7. **Documentation**: Is the code well-documented and self-explanatory?
8. **Testability**: How testable is this code?

Focus particularly on: ${validationFocus}

Provide a comprehensive architectural assessment with recommendations.`;

            console.error(`Executing Gemini architecture validation for: ${displayPath}`);

            const result = await this.executeGeminiCommand(prompt, 90000);

            this.trackOperationResult('validate_architecture', validatedPath, true, null, {
                language: detectedLanguage,
                validationFocus
            });

            return {
                content: [{
                    type: 'text',
                    text: `🏗️ **Gemini Architecture Validation - ${displayPath} (${detectedLanguage})**\n\n${result.output}${result.error ? `\n\n⚠️ **Warnings**: ${result.error}` : ''}`
                }]
            };
        } catch (error) {
            this.handleOperationError('validate_architecture', filePath, error, {
                language: language || 'unknown',
                validationFocus
            });
        }
    }

    async getReviewHistory() {
        return {
            content: [{
                type: 'text',
                text: `📋 **Review Session History**\n\n**Total Operations**: ${this.sessionContext.reviewHistory.length}\n\n${
                    this.sessionContext.reviewHistory.length > 0
                        ? this.sessionContext.reviewHistory.map((entry, index) =>
                            `**${index + 1}.** ${entry.operation} - ${entry.file} (${entry.language || 'Unknown'}) - ${new Date(entry.timestamp).toLocaleTimeString()} ${entry.success ? '✅' : '❌'}`
                        ).join('\n')
                        : 'No operations performed yet in this session.'
                }\n\n**Last Successful Operation**: ${this.sessionContext.lastReview ? `${this.sessionContext.lastReview.operation} - ${this.sessionContext.lastReview.file} (${this.sessionContext.lastReview.language || 'Unknown'}) ✅` : 'None'}`
            }]
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Gemini Code Review MCP Server (Security-Hardened v2.0.8) running on stdio');
    }
}

const server = new GeminiCodeReviewServer();
server.run().catch(console.error);
