# Claude Development Context

This file contains important context for Claude when working on this project.

## Project Overview

This is a Model Context Protocol (MCP) server that enables Claude CLI to leverage Google's Gemini CLI for code review and analysis. It's a unique dual-AI collaboration tool where Claude handles implementation and Gemini provides specialized code analysis.

## Architecture

### Core Components
- **MCP Server**: Node.js server implementing the Model Context Protocol
- **Gemini Integration**: Spawns `gemini` CLI processes for AI analysis
- **Security Layer**: Input validation, path traversal protection, binary file detection
- **Session Tracking**: Maintains operation history and context

### Available Tools
1. `gemini_code_review` - Comprehensive code review with severity ratings
2. `gemini_analyze_code` - Deep code analysis and explanation
3. `gemini_suggest_improvements` - Specific improvement recommendations
4. `gemini_validate_architecture` - Architecture and design pattern validation
5. `gemini_propose_plan` - Generate implementation plans for Claude execution
6. `get_review_history` - Session history and tracking

## Critical Technical Decisions

### MCP Protocol Compliance (v2.1.1)
- **Issue**: Original implementation returned `tool_use` objects in content arrays, violating MCP protocol
- **Solution**: Replaced with markdown-formatted text responses
- **Impact**: Manual copy/paste workflow instead of automated code replacement
- **Files Modified**: `server.js` (geminiCodeReview, geminiSuggestImprovements functions)

### Response Format
```javascript
// CORRECT (MCP compliant)
return {
    content: [{
        type: 'text',
        text: `**Rationale:**\n${explanation}\n\n**Suggested Code Change:**\n\nOld Code:\n\`\`\`${language}\n${oldCode}\n\`\`\`\n\nNew Code:\n\`\`\`${language}\n${newCode}\n\`\`\``
    }]
};

// INCORRECT (violates MCP protocol)
return {
    content: [
        { type: 'text', text: explanation },
        { type: 'tool_use', name: 'replace', arguments: {...} }  // ❌ Not allowed
    ]
};
```

### Security Patterns
- **Path Validation**: `validateFilePath()` prevents directory traversal
- **Binary Detection**: Rejects non-text files using null byte and non-printable character analysis
- **Input Sanitization**: All user input is sanitized before passing to Gemini CLI
- **File Size Limits**: 1MB max file size, 100k max prompt length

## Development Workflow

### Local Setup
```bash
# Run server locally
node server.js

# Configure with Claude CLI
claude mcp add -s project gemini-code-reviewer node server.js
claude init
```

### Testing
```bash
# Test basic functionality
claude "Use get_review_history"

# Test code review
claude "Use gemini_code_review with file_path './server.js' and focus_areas 'security'"
```

### Common Issues
- **Hanging Commands**: Usually MCP server connection issues, try local server instead of npm package
- **Gemini CLI Errors**: Verify `gemini --version` works and CLI is in PATH
- **Protocol Errors**: Check that responses only contain allowed content types (text, image, audio, resource)

## Attribution & Commit Standards

### Standard Attribution Block
For commits involving both Claude and Gemini analysis, use:

```
🤖 Generated collaboratively with [Claude CLI](https://github.com/anthropics/claude-code) and [Gemini CLI](https://github.com/google-gemini/gemini-cli)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Gemini <gemini@google.com>
```

### When to Use
- Any commit where Gemini CLI was used for code analysis/review
- Major feature implementations that involved dual-AI collaboration
- Bug fixes discovered through Gemini analysis

### Reasoning
This project uniquely leverages both AI systems:
- **Claude**: Implementation, refactoring, documentation
- **Gemini**: Code review, analysis, improvement suggestions

The attribution reflects this collaborative workflow and gives credit to both AI systems.

## Version Management

### Current Version: 2.1.1
- **Major**: Breaking changes (tool removal, API changes)
- **Minor**: New features (new tools, capabilities)  
- **Patch**: Bug fixes, compliance fixes, documentation

### Release Process
1. Update `package.json` version
2. Add entry to `CHANGELOG.md` with technical details
3. Update version references in documentation
4. Commit with proper attribution
5. Create annotated git tag: `git tag -a v{version} -m "Release message"`
6. Push commits and tags: `git push origin main && git push origin v{version}`

## Key Files

- `server.js` - Main MCP server implementation
- `package.json` - Version and dependencies
- `CHANGELOG.md` - Detailed release history
- `README.md` - User documentation
- `.mcp.json` - MCP server configuration (local)

## Language Support

Auto-detects 30+ languages via file extension. Critical to maintain the `languageMap` in `detectLanguage()` function for accurate language-specific analysis.

## Error Handling Patterns

All tool functions follow this pattern:
```javascript
try {
    // Implementation
    return { content: [{ type: 'text', text: result }] };
} catch (error) {
    this.handleOperationError('operation_name', filePath, error, additionalData);
}
```

The `handleOperationError` method provides consistent error tracking and user feedback.

## Parser Functions

### parseActionableSuggestion()
- Extracts code blocks from Gemini responses using regex
- Enhanced in v2.1.1 with better edge case handling
- Validates content is not empty after trimming
- Returns structured `{ explanation, oldCode, newCode }` or `null`

This function is critical for the code suggestion workflow and should be maintained carefully.