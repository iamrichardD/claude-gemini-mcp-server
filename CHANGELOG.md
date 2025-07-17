# Changelog

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