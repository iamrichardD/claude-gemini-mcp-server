# Changelog

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