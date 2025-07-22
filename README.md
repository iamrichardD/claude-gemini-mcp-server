# Gemini Code Reviewer

A universal Model Context Protocol (MCP) server that provides AI-powered code review and analysis for **any programming language** using Google's Gemini CLI. Perfect for developers who want intelligent code feedback directly in their development workflow.

## 🎯 Purpose

This MCP server acts as your AI-powered code reviewer, providing:
- **Comprehensive Code Reviews** with severity ratings and actionable feedback
- **Code Analysis & Explanation** for understanding complex logic
- **Improvement Suggestions** tailored to your specific goals (with **actionable code replacements**)
- **Architecture Validation** for design patterns and scalability
- **Multi-Language Support** with language-specific best practices
- **✨ NEW: Actionable Suggestions** - Direct code replacements you can approve with one click

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and configured
- Claude Code CLI or Claude Desktop
- Any Unix-like environment (Linux, macOS, WSL)

### Installation

```bash
# Install as project dependency
npm install --save-dev github:iamrichardd/claude-gemini-mcp-server

# Add MCP server to Claude CLI
claude mcp add -s project gemini-code-reviewer npx @iamrichardd/claude-gemini-mcp-server

# Initialize and approve the MCP server
claude init
# Choose option 1: "Use this and all future MCP servers in this project"
```

### Verify Installation

```bash
# Check if MCP server is registered and connected
claude mcp list
# Should show: gemini-code-reviewer ✓ connected

# Test basic functionality
claude "Use get_review_history"
```

## 📋 Available Tools

| Tool | Description | Best For |
|------|-------------|----------|
| `gemini_code_review` | Comprehensive code review with ratings and priorities (✨ **with actionable fixes**) | Code quality, bug detection, best practices |
| `gemini_analyze_code` | Deep code analysis and explanation | Understanding complex code, optimization |
| `gemini_suggest_improvements` | Specific improvement recommendations (✨ **with actionable replacements**) | Refactoring, performance, maintainability |
| `gemini_validate_architecture` | Architecture and design pattern validation | System design, scalability, SOLID principles |
| `gemini_propose_plan` | Generate structured implementation plans for other AIs to follow | Task planning, workflow design, AI collaboration |
| `get_review_history` | Session history and review tracking | Project overview, progress tracking |

## 🌍 Supported Languages

**Auto-detected support for 30+ languages:**

### Web Development
- JavaScript, TypeScript, HTML, CSS, SCSS, Sass
- React (JSX/TSX), Vue.js, Angular

### Backend & Systems
- Python, Java, C++, C, C#, Go, Rust
- PHP, Ruby, Node.js, Kotlin, Swift

### Data & Analytics
- R, SQL, MATLAB, Python (NumPy/Pandas)

### Mobile Development
- Swift (iOS), Kotlin (Android), Dart (Flutter)

### Functional & Specialized
- Haskell, Clojure, OCaml, Elixir, Erlang, Scala

### Scripting & Configuration
- Shell, Bash, PowerShell, Perl, Lua, Vim script

### Financial & Trading
- Pine Script (TradingView indicators/strategies)

*Language detection is automatic based on file extension. Manual specification is also supported.*

## 💡 Usage Examples

### Comprehensive Code Review (with Actionable Fixes)
```bash
claude "Use gemini_code_review with file_path './src/api.js' and context 'REST API endpoint' and focus_areas 'security'"
# ✨ Critical issues may include actionable fixes that you can apply directly
```

### Code Analysis & Explanation
```bash
claude "Use gemini_analyze_code with file_path './algorithm.py' and analysis_type 'optimize'"
```

### Get Improvement Suggestions (with Actionable Replacements)
```bash
claude "Use gemini_suggest_improvements with file_path './component.tsx' and improvement_goals 'performance'"
# ✨ When actionable suggestions are found, you'll get a proposed code replacement that you can approve with one click
```

### Architecture Validation
```bash
claude "Use gemini_validate_architecture with file_path './service.go' and validation_focus 'scalability'"
```

### Review Session Tracking
```bash
claude "Use get_review_history"
```

### AI Collaboration Planning
```bash
claude "Use gemini_propose_plan with prompt 'Create a user authentication system with JWT tokens'"
# Get a structured plan that Claude can then execute step by step
```

## ✨ Actionable Suggestions Feature

### What Are Actionable Suggestions?

When Gemini identifies specific code improvements, the server can now provide **direct code replacements** that you can apply with a single approval. This transforms the review process from "read suggestions → manually implement" to "review suggestion → approve replacement → done."

### How It Works

1. **Structured Analysis**: Gemini analyzes your code and identifies specific improvements
2. **Code Extraction**: The server parses Gemini's response for actionable code blocks
3. **Replace Proposal**: You receive both the explanation AND a proposed `replace` tool call
4. **One-Click Apply**: Approve the replacement to automatically update your file

### Example Workflow

```bash
# Request improvement suggestions
claude "Use gemini_suggest_improvements with file_path './api.js' and improvement_goals 'performance'"
```

**Traditional Response (text-only):**
```
💡 Gemini Improvement Suggestions - api.js (JavaScript)

Consider using async/await instead of nested callbacks for better readability...
```

**New Actionable Response:**
```
💡 Gemini Improvement Suggestion - api.js (JavaScript)

This code uses nested callbacks which can lead to callback hell. Converting to async/await will improve readability and error handling.

[Proposed Replace Tool Call]
File: ./api.js
Replace: 
  getData(callback) {
    db.query('SELECT * FROM users', (err, result) => {
      if (err) callback(err);
      else callback(null, result);
    });
  }
With:
  async getData() {
    try {
      const result = await db.query('SELECT * FROM users');
      return result;
    } catch (err) {
      throw err;
    }
  }

✅ Click to approve this replacement
```

### When Do You Get Actionable Suggestions?

- **`gemini_code_review`**: For critical issues that have clear, direct fixes
- **`gemini_suggest_improvements`**: For any improvement that can be implemented as a code replacement
- **Automatic Detection**: The server automatically determines when suggestions are actionable
- **Fallback**: If no actionable suggestions are found, you get traditional text-only feedback

### Benefits

- **Faster Implementation**: No manual copy-paste or retyping
- **Accuracy**: Exact code replacements with proper formatting and indentation
- **Context Preservation**: Full explanation alongside the actionable change
- **User Control**: Every replacement requires your explicit approval
- **Backward Compatible**: Existing workflows continue to work unchanged

## 🔧 Configuration

### Claude CLI MCP Setup

The MCP server integrates with Claude CLI using project-level configuration:

```bash
# Add MCP server to your project
claude mcp add -s project gemini-code-reviewer npx @iamrichardd/claude-gemini-mcp-server

# Initialize and approve MCP servers
claude init
# Choose option 1 for persistent approval
```

### Manual Configuration (if needed)

Create `.mcp.json` in your project root:

**For Production Usage (published package):**
```json
{
  "mcpServers": {
    "gemini-code-reviewer": {
      "command": "npx",
      "args": ["@iamrichardd/claude-gemini-mcp-server"],
      "transport": "stdio"
    }
  }
}
```

**For Local Development:**
```json
{
  "mcpServers": {
    "gemini-code-reviewer": {
      "command": "node",
      "args": ["server.js"],
      "transport": "stdio"
    }
  }
}
```

## 🔍 Tool Parameters

### `gemini_code_review`
- **file_path** (required): Path to source code file
- **context** (optional): Additional context about the code
- **focus_areas** (optional): `syntax`, `logic`, `performance`, `best_practices`, `security`, `testing`
- **language** (optional): Programming language (auto-detected if not specified)

### `gemini_analyze_code`
- **file_path** (required): Path to source code file
- **analysis_type** (optional): `explain`, `optimize`, `debug`, `refactor`, `compare`
- **language** (optional): Programming language (auto-detected)

### `gemini_suggest_improvements`
- **file_path** (required): Path to source code file
- **improvement_goals** (optional): `performance`, `readability`, `maintainability`, `scalability`, `security`
- **language** (optional): Programming language (auto-detected)

### `gemini_validate_architecture`
- **file_path** (required): Path to source code file or directory
- **validation_focus** (optional): `architecture`, `design_patterns`, `scalability`, `testability`, `maintainability`
- **language** (optional): Programming language (auto-detected)

### `gemini_propose_plan`
- **prompt** (required): High-level user request or task description that needs a plan
- **conversation_history** (optional): Previous conversation context for iterative refinement of the plan

## 🛠️ Development Workflow

### Recommended Usage Pattern

1. **Implement** your code using Claude Code CLI directly
2. **Review** using `gemini_code_review` for comprehensive feedback (✨ **apply critical fixes instantly**)
3. **Analyze** complex sections with `gemini_analyze_code`
4. **Improve** based on `gemini_suggest_improvements` recommendations (✨ **approve replacements with one click**)
5. **Validate** overall architecture with `gemini_validate_architecture`
6. **Track** progress with `get_review_history`

### ✨ New Workflow with Actionable Suggestions

1. **Request Review/Suggestions** → Server analyzes code
2. **Receive Actionable Proposals** → Get explanation + proposed code replacement
3. **Review & Approve** → Examine the suggested change
4. **Auto-Apply** → Code is updated automatically upon approval
5. **Iterate** → Continue with next suggestions or move to validation

### Integration with IDEs

Works seamlessly with:
- **Claude Code CLI** (primary integration)
- **Claude Desktop** (alternative setup)
- **WebStorm/IntelliJ** (via Claude Code plugin)
- **VS Code** (via Claude Code integration)

## 🚨 Troubleshooting

### MCP Server Not Found
```bash
# Check installation
npm list | grep claude-gemini-mcp-server

# Reinstall if needed
npm install --save-dev github:iamrichardd/claude-gemini-mcp-server
claude mcp add -s project gemini-code-reviewer npx @iamrichardd/claude-gemini-mcp-server
claude init
```

### MCP Server Connection Hanging
If commands like `claude "Use get_review_history"` hang or timeout:

```bash
# For local development, use local server instead of npm package
claude mcp add -s project gemini-code-reviewer node server.js
claude init

# Verify server starts locally
node server.js
# Should show: "Gemini Code Review MCP Server (Security-Hardened v2.1.0) running on stdio"

# Check .mcp.json uses correct configuration
cat .mcp.json
# For local dev: should use "command": "node", "args": ["server.js"]
# For published package: should use "command": "npx", "args": ["@iamrichardd/claude-gemini-mcp-server"]
```

### Gemini CLI Issues
```bash
# Test Gemini CLI directly
gemini -p "test prompt"

# Verify authentication and availability
gemini --version

# Check if Gemini CLI is in PATH
which gemini
```

### Permission Issues
```bash
# Ensure MCP server is approved
claude init
# Choose option 1: "Use this and all future MCP servers in this project"

# Check MCP server status
claude mcp list
# Should show: gemini-code-reviewer ✓ connected
```

### Binary File Errors
```bash
# The server automatically detects and rejects binary files
# Error: "File appears to be binary, not a text-based source code file"
# Solution: Ensure you're pointing to text-based source code files only
```

### Language Detection Issues
```bash
# Manually specify language if auto-detection fails
claude "Use gemini_code_review with file_path './script' and language 'Python'"
```

### Server Execution Issues
```bash
# Verify server starts correctly
npx @iamrichardd/claude-gemini-mcp-server
# Should show: "Gemini Code Review MCP Server (Security-Hardened v2.0.7) running on stdio"

# Check file permissions
chmod +x node_modules/@iamrichardd/claude-gemini-mcp-server/server.js
```

### Error Stack Trace Issues
```bash
# The server preserves complete error context for debugging
# Check logs for detailed error information including:
# - Original error message and stack trace
# - Operation context (file path, operation type)
# - Error cause chain for complete debugging context
```

## 🤝 Contributing

Contributions welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/iamrichardd/claude-gemini-mcp-server.git
cd claude-gemini-mcp-server
npm install

# Configure MCP server for local development
claude mcp add -s project gemini-code-reviewer node server.js

# Initialize and approve the MCP server
claude init
# Choose option 1: "Use this and all future MCP servers in this project"

# Start development server
npm run dev
```

### Local Development Configuration

For local development, use the local server instead of the npm package:

```json
{
  "mcpServers": {
    "gemini-code-reviewer": {
      "command": "node",
      "args": ["server.js"],
      "transport": "stdio"
    }
  }
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Tools

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Google's AI CLI tool
- [Claude Code CLI](https://docs.anthropic.com) - Anthropic's AI development assistant
- [Model Context Protocol](https://modelcontextprotocol.io) - Standard for AI tool integration

## 📊 Use Cases

### For Individual Developers
- **Code Quality Assurance**: Automated reviews before commits
- **Learning Tool**: Understand complex codebases and patterns
- **Performance Optimization**: Identify bottlenecks and improvements
- **Best Practices**: Language-specific recommendations

### For Teams
- **Code Review Automation**: Pre-review screening and feedback
- **Architecture Validation**: Ensure design consistency
- **Onboarding**: Help new team members understand code
- **Documentation**: Generate explanations for complex logic

### For Specific Domains
- **Web Development**: Security, performance, accessibility reviews
- **Backend Systems**: Scalability, reliability, architecture validation
- **Data Science**: Algorithm optimization, code clarity
- **Mobile Development**: Platform-specific best practices
- **Financial/Trading**: Pine Script strategy validation and optimization

---

**Powered by Google Gemini AI** | **Compatible with Claude Code** | **Universal Language Support**
