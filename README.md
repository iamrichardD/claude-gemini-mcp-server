# Gemini Code Reviewer

A universal Model Context Protocol (MCP) server that provides AI-powered code review and analysis for **any programming language** using Google's Gemini CLI. Perfect for developers who want intelligent code feedback directly in their development workflow.

## 🎯 Purpose

This MCP server acts as your AI-powered code reviewer, providing:
- **Comprehensive Code Reviews** with severity ratings and actionable feedback
- **Code Analysis & Explanation** for understanding complex logic
- **Improvement Suggestions** tailored to your specific goals
- **Architecture Validation** for design patterns and scalability
- **Multi-Language Support** with language-specific best practices

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and configured
- Claude Code CLI or Claude Desktop
- Any Unix-like environment (Linux, macOS, WSL)

### Installation

```bash
# Install as project dependency
npm install --save-dev github:iamrichardd/gemini-code-reviewer

# Add MCP server to Claude CLI
claude mcp add -s project gemini-code-reviewer npx gemini-code-reviewer

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
| `gemini_code_review` | Comprehensive code review with ratings and priorities | Code quality, bug detection, best practices |
| `gemini_analyze_code` | Deep code analysis and explanation | Understanding complex code, optimization |
| `gemini_suggest_improvements` | Specific improvement recommendations | Refactoring, performance, maintainability |
| `gemini_validate_architecture` | Architecture and design pattern validation | System design, scalability, SOLID principles |
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

### Comprehensive Code Review
```bash
claude "Use gemini_code_review with file_path './src/api.js' and context 'REST API endpoint' and focus_areas 'security'"
```

### Code Analysis & Explanation
```bash
claude "Use gemini_analyze_code with file_path './algorithm.py' and analysis_type 'optimize'"
```

### Get Improvement Suggestions
```bash
claude "Use gemini_suggest_improvements with file_path './component.tsx' and improvement_goals 'performance'"
```

### Architecture Validation
```bash
claude "Use gemini_validate_architecture with file_path './service.go' and validation_focus 'scalability'"
```

### Review Session Tracking
```bash
claude "Use get_review_history"
```

## 🔧 Configuration

### Claude CLI MCP Setup

The MCP server integrates with Claude CLI using project-level configuration:

```bash
# Add MCP server to your project
claude mcp add -s project gemini-code-reviewer npx gemini-code-reviewer

# Initialize and approve MCP servers
claude init
# Choose option 1 for persistent approval
```

### Manual Configuration (if needed)

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "gemini-code-reviewer": {
      "command": "npx",
      "args": ["gemini-code-reviewer"],
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

## 🛠️ Development Workflow

### Recommended Usage Pattern

1. **Implement** your code using Claude Code CLI directly
2. **Review** using `gemini_code_review` for comprehensive feedback
3. **Analyze** complex sections with `gemini_analyze_code`
4. **Improve** based on `gemini_suggest_improvements` recommendations
5. **Validate** overall architecture with `gemini_validate_architecture`
6. **Track** progress with `get_review_history`

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
npm list | grep gemini-code-reviewer

# Reinstall if needed
npm install --save-dev github:iamrichardd/gemini-code-reviewer
claude mcp add -s project gemini-code-reviewer npx gemini-code-reviewer
claude init
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
npx gemini-code-reviewer
# Should show: "Gemini Code Review MCP Server (Security-Hardened v2.0.7) running on stdio"

# Check file permissions
chmod +x node_modules/@iamrichardd/gemini-code-reviewer/server.js
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
git clone https://github.com/iamrichardd/gemini-code-reviewer.git
cd gemini-code-reviewer
npm install
npm run dev
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
