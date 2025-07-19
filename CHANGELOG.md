# Changelog

## [2.0.8] - 2025-07-19

### ✨ Added
- **Actionable Suggestions Feature**: Revolutionary new capability that provides direct code replacements you can approve with one click
- **Structured Response Parsing**: Server now parses Gemini responses for actionable code blocks using `--- OLD_CODE ---` and `--- NEW_CODE ---` markers
- **Tool Use Proposals**: When actionable suggestions are found, server returns both explanation text AND proposed `replace` tool calls
- **Seamless User Control**: Every code replacement requires explicit user approval before being applied

### Enhanced
- **`gemini_code_review`**: Now provides actionable fixes for critical issues alongside traditional text feedback
- **`gemini_suggest_improvements`**: All improvement suggestions can now be applied as direct code replacements when actionable
- **Backward Compatibility**: Existing workflows continue unchanged - actionable suggestions are an enhancement, not a replacement

### Technical Details
- Added `parseActionableSuggestion()` method with regex-based code block extraction
- Enhanced prompts to instruct Gemini to provide structured, machine-readable output when applicable
- Modified tool return logic to include `tool_use` objects with `replace` calls when actionable suggestions are detected
- Operation tracking now includes `actionable: true/false` flag for analytics
- Fallback behavior ensures traditional text-only responses when no actionable suggestions are found

### Benefits
- **Faster Implementation**: No manual copy-paste or retyping of suggested improvements
- **Higher Accuracy**: Exact code replacements with proper formatting and indentation preserved
- **Enhanced Workflow**: Transforms "read → manually implement" to "review → approve → done"
- **Complete Context**: Full explanations provided alongside actionable changes

## [2.0.7] - 2025-07-18

### Changed
- Increased the maximum prompt length from 50,000 to 100,000 characters to accommodate larger files for analysis.

## [2.0.0] - 2025-07-17

### 🚀 Major Release: Universal Code Review Server

### Added
- **Universal Language Support**: Auto-detection and support for 30+ programming languages
- **Language-Specific Analysis**: Tailored prompts and best practices for each language
- **Architecture Validation Tool**: Comprehensive design pattern and scalability assessment
- **Session History Tracking**: Review history with language and timestamp information
- **Intelligent Language Detection**: Automatic detection from file extensions
- **Enhanced Tool Parameters**: Optional language specification for edge cases

### Changed
- **BREAKING**: Renamed from `claude-gemini-mcp-server` to `gemini-code-reviewer`
- **BREAKING**: Simplified architecture - removed Claude CLI subprocess (you're already in Claude CLI)
- **BREAKING**: Tool name changes:
  - `claude_code_implement` → Removed (you implement directly in Claude CLI)
  - `pair_programming_cycle` → Removed (simplified workflow)
  - `gemini_validate_strategy` → `gemini_validate_architecture` (universal)
- **Enhanced Prompts**: Language-aware prompts with specific conventions and idioms
- **Improved Error Handling**: Better error messages and debugging information
- **Extended Timeouts**: Longer timeouts for complex analysis tasks

### Removed
- **Claude CLI Subprocess**: Eliminated subprocess execution issues entirely
- **Pine Script Specificity**: No longer limited to Pine Script development
- **Complex Pair Programming Logic**: Simplified to focus on code review excellence

### Technical Details
- Complete rewrite focusing on Gemini CLI as the sole AI provider
- Cleaner architecture with specialized tools for different review aspects
- Language detection supports: Web (JS/TS/React), Backend (Python/Java/Go), Mobile (Swift/Kotlin), Data (R/SQL), Functional (Haskell/Clojure), Scripting (Shell/Bash), and many more
- Maintains excellent Pine Script support while expanding to all languages

### Migration Guide
- Update package name: `@iamrichardd/gemini-code-reviewer`
- Update MCP registration: `claude mcp add -s project gemini-code-reviewer npx gemini-code-reviewer`
- Use new tool names: `gemini_code_review`, `gemini_analyze_code`, `gemini_suggest_improvements`, `gemini_validate_architecture`
- Implement code directly in Claude CLI, then use MCP server for review

## [1.0.4] - 2025-07-17

### Fixed
- **Critical Fix**: Resolved CLI subprocess hanging when called from within Claude CLI environment
- Added environment isolation using `env -i` to prevent recursive execution detection
- Fixed both `claude_implement` and `gemini_code_review` tools hanging/timeout issues
- Enabled reliable `pair_programming_cycle` execution without subprocess conflicts

### Changed
- Command execution now uses environment isolation:
  - `claude -p "prompt"` → `env -i PATH="..." HOME="..." claude -p "prompt"`
  - `gemini -p "prompt"` → `env -i PATH="..." HOME="..." gemini -p "prompt"`
- Reduced timeout to 30 seconds since commands now execute immediately

### Technical Details
- Claude CLI detects when running from within another Claude process and waits indefinitely
- Environment isolation (`env -i`) prevents this detection while preserving necessary PATH and HOME
- This fix enables the MCP server to reliably execute CLI subprocesses

## [1.0.3] - 2025-07-17

### Fixed
- **Critical Fix**: Added `-p` flag to both Claude and Gemini CLI calls for non-interactive execution
- Resolved hanging/timeout issues when MCP server executes CLI commands as subprocesses
- Fixed `pair_programming_cycle` tool execution that was being cancelled due to hanging processes
- Both `claude_implement` and `gemini_code_review` tools now work reliably

### Changed
- Command execution: `claude "prompt"` → `claude -p "prompt"`
- Command execution: `gemini "prompt"` → `gemini -p "prompt"`
- Increased timeout to 60 seconds for non-interactive CLI execution
- Enhanced error handling and debug logging

### Technical Details
- Interactive CLI tools start sessions waiting for user input when called without flags
- Non-interactive mode (`-p` flag) processes prompt and exits cleanly
- This fix enables reliable subprocess execution from MCP server

## [1.0.1] - 2025-07-17

### Fixed
- Changed CLI command from `claude-code` to `claude` to match actual Claude CLI installation
- Renamed `claude_code_implement` tool to `claude_implement` for consistency
- Updated all documentation references from "Claude Code CLI" to "Claude CLI"
- Fixed Gemini CLI link to point to correct GitHub repository

### Changed
- Tool name: `claude_code_implement` → `claude_implement`
- Command execution: `claude-code` → `claude`
- Error messages updated to reflect correct CLI name
- Gemini CLI link: https://cloud.google.com/vertex-ai → https://github.com/google-gemini/gemini-cli

### Added
- Claude CLI MCP setup instructions using `claude mcp add` and `claude init`
- Manual configuration instructions for `.mcp.json`
- Enhanced troubleshooting section for Claude CLI integration
- Verification steps for MCP server connection status

## [1.0.0] - 2025-07-17

### Added
- Initial release of Claude-Gemini MCP Server
- Pair programming workflow with Claude as driver, Gemini as navigator
- Support for Pine Script development
- Automated iteration cycle with feedback incorporation
- Tools: `claude_code_implement`, `gemini_code_review`, `pair_programming_cycle`, `get_session_context`
- WebStorm integration capabilities
- Project-specific and user-level MCP server configuration
- Comprehensive documentation and usage examples
- 