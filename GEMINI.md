# Gemini Project Context (`GEMINI.md`)

This document provides essential context for the Gemini agent to ensure efficient and accurate development assistance for this project.

### 1. Project Overview & Core Technology

*   **Description:** This is a Node.js server that implements the Model Context Protocol (MCP).
*   **Core Dependency:** The server's primary function is to act as a wrapper around the `gemini` command-line tool.
*   **Main File:** The main application logic is contained within `server.js`.

### 2. Architectural Constraints & Conventions

*   **MCP Compliance:** The server must strictly adhere to the MCP specification.
*   **Tool Responses:** A critical constraint is that tool responses **must not** include `tool_use` objects in the `content` array. All actionable suggestions (like code changes) must be formatted as markdown within a `text` object.
*   **Code Suggestion Format:** The established convention for code suggestions is a markdown block containing:
    *   A `**Rationale:**` section explaining the change.
    *   An `Old Code:` block.
    *   A `New Code:` block.
*   **Suggestion Parsing:** The server uses a dedicated `parseActionableSuggestion` function to extract `--- OLD_CODE ---` and `--- NEW_CODE ---` blocks from the `gemini` CLI's output.

### 3. Security & Validation Context

This server implements several security and validation layers to ensure safe operation:

*   **Working Directory Sandboxing:** Path traversal is prevented by ensuring all file paths resolve within the project's working directory. (See `validateFilePath()` in `server.js:75-77`)
*   **Binary File Rejection:** The server detects and rejects binary files by analyzing for null bytes and non-printable characters. (See `validateFileAccess()` in `server.js:107-112`)
*   **Input Sanitization:** All user-provided inputs are sanitized to remove control characters and prevent injection attacks. (See `sanitizeInput()` in `server.js:132-145`)
*   **Resource Limits:** Strict file size and prompt length limits are enforced. (See `config` in `server.js:47-48`)
    *   Max file size: 1MB
    *   Max prompt length: 100,000 characters

### 4. Tool-Specific Context

The server exposes six distinct tools, each with a specific purpose:

*   **`gemini_code_review`:** Performs a comprehensive review, providing severity ratings and priority actions. (server.js:496-581)
*   **`gemini_suggest_improvements`:** Focuses on suggesting performance and maintainability enhancements, complete with code examples. (server.js:638-715)
*   **`gemini_validate_architecture`:** Validates code against architectural best practices, design patterns, and scalability principles. (server.js:717-774)
*   **`gemini_analyze_code`:** Provides deep code analysis across several modes: `explain`, `optimize`, `debug`, `refactor`, and `compare`. (server.js:583-635)
*   **`gemini_propose_plan`:** Generates structured, step-by-step implementation plans intended for execution by another AI, like the Claude CLI. (server.js:776-841)
*   **`get_review_history`:** Retrieves the history of operations performed during the current session. (server.js:843-856)

### 5. Version & Change Context

*   **v2.1.1:** This version specifically addressed a critical MCP compliance issue.
*   **Breaking Change:** The automated code replacement workflow (which relied on the non-compliant `tool_use` object) was removed.
*   **User Workflow:** Users must now manually copy and paste code suggestions from the markdown-formatted text responses.
*   **Versioning:** The project follows semantic versioning (`major.minor.patch`).

### 6. Testing & Development Workflow

*   **Local Testing:** Use the Claude CLI to test the server locally with the command: `claude mcp add -s project gemini-code-reviewer node server.js`
*   **Common Debugging:** Be aware of potential issues like hanging commands (timeouts), Gemini CLI errors, or MCP protocol validation errors.
*   **Configuration:** The `README.md` (lines 180-208) outlines configuration patterns for development versus production environments.

### 7. Collaborative Attribution Standards

This project utilizes a unique dual-AI attribution standard for commits where both Claude and Gemini are involved in the development process.

*   **Commit Message Format:** For any commits involving both Claude implementation and Gemini analysis, the following attribution block must be included in the commit message:

    ```
    Generated collaboratively with [Claude CLI](https://github.com/anthropics/claude-code) and [Gemini CLI](https://github.com/google-gemini/gemini-cli)

    Co-Authored-By: Claude <noreply@anthropic.com>
    Co-Authored-By: Gemini <gemini@google.com>
    ```
