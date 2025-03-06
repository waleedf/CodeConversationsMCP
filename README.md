# CodingConversationsMCP

An Model Context Protocol (MCP) server that allows Claude to consult external AI models through OpenRouter. This server is designed to handle edge cases where a coding agent might need to get external input, explore alternative approaches, debug complex issues, or get optimal responses.

The goal of CodeConversations is to enable Claude to talk to all its LLM buddies, whenever it wants. With CodeConversations, you're not just talking to Claude-- You're talking to a team.

## Features

- Consult external models like o3-mini and Gemini through OpenRouter
- Simple configuration via JSON
- Focuses on coding-related tasks
- Exposes a straightforward MCP tool interface

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/coding-conversations-mcp.git
cd coding-conversations-mcp
npm install
```

## Configuration

Edit the `src/config/models-config.json` file to set up your models:

```json
{
  "models": {
    "o3-mini": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "anthropic/claude-3-opus-20240229",
      "token": "YOUR_OPENROUTER_API_KEY"
    },
    "gemini": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "google/gemini-pro",
      "token": "YOUR_OPENROUTER_API_KEY"
    }
  },
  "routing": {
    "default_model": "o3-mini"
  }
}
```

Replace `YOUR_OPENROUTER_API_KEY` with your actual OpenRouter API key.

## Build and Run

Build the TypeScript code:

```bash
npm run build
```

Run the server:

```bash
npm start
```

## Integrating with Cline

To use this server with Cline, add it to your MCP settings file (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "coding-conversations": {
      "command": "node",
      "args": ["/path/to/coding-conversations-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Usage

Once integrated, Claude can use the `call_external_model` tool to query external models through OpenRouter:

```typescript
// Example call
{
  "model": "o3-mini", // Optional, defaults to o3-mini if not specified
  "message": "What's a better way to implement this React useEffect hook to avoid infinite re-renders?",
  "context": "I'm debugging a React application" // Optional
}
```

## License

MIT
