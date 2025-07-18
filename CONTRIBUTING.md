# Contributing to Gemini Code Reviewer

Thank you for your interest in contributing to the Gemini Code Reviewer MCP server! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or request features
- Provide clear, detailed descriptions with steps to reproduce
- Include system information (OS, Node.js version, Gemini CLI version)
- Add relevant error messages and logs

### Suggesting Enhancements
- Check existing issues to avoid duplicates
- Clearly describe the enhancement and its benefits
- Consider backward compatibility implications
- Provide examples of how the feature would be used

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork and submit a pull request

## 🏗️ Development Setup

### Prerequisites
- Node.js v18+
- Gemini CLI installed and configured
- Claude Code CLI for testing
- Git for version control

### Local Development
```bash
# Clone your fork
git clone https://github.com/yourusername/gemini-code-reviewer.git
cd gemini-code-reviewer

# Install dependencies
npm install

# Run in development mode
npm run dev

# Test the server
npx gemini-code-reviewer
```

### Testing Your Changes
```bash
# Test MCP server functionality
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npx gemini-code-reviewer

# Verify shebang is correct
head -1 server.js
# Should show: #!/usr/bin/env node

# Test execution permissions
chmod +x server.js
./server.js

# Test with Claude CLI
claude mcp add -s project test-gemini-reviewer npx ./server.js
claude "Use gemini_code_review with file_path './test.js'"

# Test error handling
claude "Use gemini_code_review with file_path './nonexistent.js'"
# Should show proper error context with stack traces
```

## 📝 Coding Standards

### Error Handling Guidelines
- Always preserve original error stack traces using `error.cause`
- Use consistent error message formats across operations
- Include operation context (file path, operation type) in errors
- Log complete error chains for debugging

### Example Error Handling
```javascript
try {
  // risky operation
} catch (error) {
  // DON'T: throw new Error(error.message) - loses stack trace
  
  // DO: preserve original error
  const enhancedError = new Error(`Operation failed: ${error.message}`);
  enhancedError.cause = error;
  enhancedError.stack = error.stack;
  enhancedError.operation = 'operation_name';
  throw enhancedError;
}
```

### Security Requirements
- Never use shell execution with user input
- Always use `spawn()` with argument arrays instead of shell commands
- Validate all file paths for traversal attacks
- Sanitize all user input with length and character limits
- Implement binary file detection for source code validation

## 🧪 Testing Requirements

### Manual Testing
- Test with multiple programming languages
- Verify language detection accuracy
- Test error handling with invalid files
- Confirm MCP protocol compliance

### Test Cases to Cover
- Language detection for all supported file extensions
- Error handling for missing files, invalid syntax
- Timeout handling for long-running operations
- Memory usage with large files
- Concurrent request handling

### Testing Checklist
- [ ] Server starts without errors
- [ ] Tools list correctly via MCP protocol
- [ ] Language detection works for target languages
- [ ] Error messages are helpful and actionable
- [ ] Performance is acceptable for typical file sizes
- [ ] Memory usage remains stable

## 📋 Pull Request Guidelines

### Before Submitting
- Ensure your code follows the style guidelines
- Test your changes with multiple file types
- Update documentation if needed
- Add or update tests for new functionality
- Verify backward compatibility

### Pull Request Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested with multiple programming languages
- [ ] Manual testing completed
- [ ] Error handling verified
- [ ] Performance impact assessed

## Languages Tested
- [ ] JavaScript/TypeScript
- [ ] Python
- [ ] Java
- [ ] C++/C
- [ ] Other: ___________

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 🎯 Priority Areas for Contributions

### High Priority
- **Language Support**: Add detection for new programming languages
- **Error Handling**: Improve error messages and recovery
- **Performance**: Optimize for large files and concurrent requests
- **Documentation**: Improve usage examples and troubleshooting

### Medium Priority
- **New Analysis Types**: Additional code analysis capabilities
- **Configuration Options**: More customizable behavior
- **Integration**: Better IDE and tool integration
- **Testing**: Automated test suite development

### Nice to Have
- **UI Improvements**: Better formatted output
- **Caching**: Cache analysis results for performance
- **Metrics**: Usage analytics and performance monitoring
- **Plugins**: Extensible architecture for custom analyzers

## 🌍 Language Support Contributions

### Adding New Languages
1. Update the `detectLanguage` method with new file extensions
2. Test language detection accuracy
3. Verify Gemini CLI handles the language appropriately
4. Update documentation with the new language
5. Provide test files for the new language

### Language-Specific Improvements
- Enhance prompts for specific languages
- Add language-specific best practices
- Improve error detection for language features
- Add examples in documentation

## 🐛 Bug Reports

### Required Information
- **Environment**: OS, Node.js version, Gemini CLI version
- **File Type**: Programming language and file extension
- **Error Message**: Complete error output
- **Steps to Reproduce**: Exact commands and files used
- **Expected vs Actual**: What should happen vs what actually happens

### Bug Report Template
```markdown
**Environment:**
- OS: [e.g., Ubuntu 22.04, macOS 14, Windows 11]
- Node.js: [e.g., v18.17.0]
- Gemini CLI: [e.g., v1.2.3]

**File Information:**
- Language: [e.g., Python]
- File size: [e.g., 150 lines]
- File extension: [e.g., .py]

**Issue Description:**
Clear description of the problem.

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen.

**Actual Behavior:**
What actually happens.

**Error Output:**
```
Paste error messages here
```

**Additional Context:**
Any other relevant information.
```

## 📖 Documentation Contributions

### Areas Needing Documentation
- Usage examples for different programming languages
- Integration guides for various IDEs
- Troubleshooting common issues
- Performance optimization tips
- Advanced configuration options

### Documentation Standards
- Use clear, concise language
- Include practical examples
- Test all code examples
- Keep formatting consistent
- Update table of contents when needed

## 🏷️ Versioning and Releases

### Semantic Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Process
1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create Git tag: `git tag v2.1.0`
4. Push tag: `git push origin v2.1.0`
5. GitHub Actions handles npm publishing

## 💬 Community and Support

### Getting Help
- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and feature ideas
- **Documentation**: Check README and examples first

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the technical merits

Thank you for contributing to make Gemini Code Reviewer better for everyone! 🚀
