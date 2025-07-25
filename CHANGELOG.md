# Changelog

## [2.1.1] - 2025-07-22

### 🔧 Fixed
- **MCP Protocol Compliance**: Resolved Zod validation errors by removing `tool_use` objects from response content arrays
- **Response Format**: Code suggestions now displayed as markdown-formatted text within text responses instead of separate tool calls
- **User Experience**: Enhanced formatting with "Rationale:" heading for better readability and structure
- **Parser Robustness**: Improved `parseActionableSuggestion` function with better edge case handling and validation

### Technical Details
- Fixed `geminiCodeReview` and `geminiSuggestImprovements` functions to return only `type: 'text'` objects
- Content arrays now comply with MCP protocol specifications (text, image, audio, resource_link, resource only)
- Enhanced code suggestion parsing with empty content validation and trimming
- Added documentation comments explaining MCP compliance rationale for future developers

### Breaking Changes
- **Actionable suggestions no longer generate tool_use objects** - suggestions are now presented as formatted markdown text
- Users can manually copy/paste suggested code changes instead of one-click approval
- Maintains all functionality while ensuring protocol compliance

### Benefits
- **Full MCP Compliance**: Eliminates protocol validation errors
- **Improved Reliability**: Robust parsing prevents malformed response issues  
- **Better Formatting**: Clear separation between explanation and code suggestions
- **Future-Proof**: Compliant with Model Context Protocol specifications

## [2.1.0] - 2025-07-21

### ✨ Added
- **AI Collaboration Workflow**: New `gemini_propose_plan` tool enables seamless Gemini-Claude collaboration
- **Strategic Planning Tool**: Gemini acts as a "planner" creating structured, step-by-step implementation plans for Claude to execute
- **Iterative Plan Refinement**: Supports conversation history for progressive plan improvement and context retention
- **Enhanced AI Parsability**: Markdown code fence formatting for file paths, code snippets, and terminal commands
- **Extended Timeout Support**: 90-second timeout for complex planning operations

### 🔧 Enhanced
- **Prompt Engineering**: Sophisticated planning prompts that instruct Gemini to create actionable, AI-executable plans
- **Session Tracking**: Consistent operation naming with `gemini_propose_plan` for improved debugging and analytics
- **Documentation**: Comprehensive usage examples and parameter documentation for the new workflow

### Technical Details
- Added `geminiProposePlan()` method with full error handling and session tracking integration
- Structured planning prompt with 5-phase approach: Analysis, Planning, Implementation, Testing, Finalization
- Input sanitization for both primary prompt (100k chars) and conversation history (10k chars)
- Markdown code fence instructions for better AI collaboration and parsing reliability
- Tool registration with proper input schema validation and required parameter specification

### Benefits
- **Seamless AI Collaboration**: Enables natural workflow where Gemini creates plans and Claude executes them
- **Enhanced Reliability**: Structured markdown formatting improves plan parsing and execution accuracy
- **Workflow Efficiency**: Reduces implementation time through strategic pre-planning and task breakdown
- **Context Preservation**: Conversation history enables iterative improvement of complex plans
- **Universal Application**: Works for any development task regardless of programming language or complexity

### Usage Example
```bash
claude "Use gemini_propose_plan with prompt 'Create a user authentication system with JWT tokens'"
# Gemini generates structured plan → Claude executes step-by-step
```

## [2.0.10] - 2025-07-19

### 🔧 Enhanced
- **Dynamic Version Reading**: Server now reads version from package.json automatically
- **Error Resilience**: Added robust error handling for missing/malformed package.json
- **Graceful Fallback**: Uses '0.0.0-dev' when package.json is unavailable
- **Code Quality**: Applied ES6 property shorthand and destructuring patterns

### Technical Details
- Implemented `createRequire` pattern for ES module compatibility
- Added try-catch block to prevent startup crashes from version reading failures
- Consolidated version logic with destructuring: `{ version: packageVersion }`
- Enhanced startup logging with dynamic version display
- Eliminates version consistency issues between package.json and server code

### Benefits
- **Centralized Version Management**: Single source of truth in package.json
- **Maintenance Simplification**: No manual version updates required in server code
- **Development Reliability**: Graceful degradation when package.json is missing
- **Modern JavaScript Patterns**: Clean, readable ES6+ syntax throughout

## [2.0.9] - 2025-07-19

### 🔒 Security
- **CRITICAL FIX**: Resolved path traversal vulnerability in `validateFilePath()` function
- **Enhanced Security**: Added robust directory boundary validation with explicit path separator checks
- **Edge Case Protection**: Prevents similar-named directory attacks (e.g., `/app/project-evil` when working dir is `/app/project`)

### Technical Details
- Fixed vulnerable conditional that bypassed security checks for absolute paths
- Implemented strict path validation: `!resolvedPath.startsWith(this.workingDirectory + path.sep) && resolvedPath !== this.workingDirectory`
- All file operations now strictly enforced within designated working directory
- Prevents unauthorized access to system files like `/etc/passwd`, `/home/user/.ssh/id_rsa`

### Security Impact
- **Severity**: Critical vulnerability resolved
- **Attack Vector**: Path traversal via absolute file paths
- **Mitigation**: Complete - all file access now properly sandboxed

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