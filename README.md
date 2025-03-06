# Coding Conversations MCP Server

A Model Context Protocol (MCP) server that enables Claude to access external AI models for coding assistance through OpenRouter.

## Features

- Provides a `call_external_model` tool to Claude
- Allows consulting external AI models like Claude-3-Opus and Gemini Pro
- Useful for debugging, getting second opinions, or exploring alternative coding approaches
- Configurable model routing via JSON configuration

## Installation

1. Clone the repository:
```
git clone https://github.com/your-username/coding-conversations-mcp.git
cd coding-conversations-mcp
```

2. Install dependencies:
```
npm install
```

3. Create your configuration file:
```
cp src/config/models-config.template.json src/config/models-config.json
```

4. Edit `src/config/models-config.json` and add your OpenRouter API key

5. Build the project:
```
npm run build
```

## Configuration

### Setting up models-config.json

Edit the `src/config/models-config.json` file to configure which models are available:

```json
{
  "models": {
    "o3-mini": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "anthropic/claude-3-opus-20240229",
      "token": "YOUR_OPENROUTER_API_KEY_HERE"
    },
    "gemini": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "google/gemini-pro",
      "token": "YOUR_OPENROUTER_API_KEY_HERE"
    }
  },
  "routing": {
    "default_model": "o3-mini"
  }
}
```

### Configuring with Claude

#### For Claude VSCode Extension

Edit the settings file at:
`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Add your MCP server:

```json
{
  "mcpServers": {
    "coding-conversations": {
      "command": "node",
      "args": ["/path/to/your/coding-conversations-mcp/dist/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### For Claude Desktop App

Edit the settings file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

Add your MCP server similar to the VSCode example above.

## Usage

Once configured, ask Claude to use the `call_external_model` tool to consult an external model:

```
Can you use the call_external_model tool to ask Gemini about the best way to implement promise.all with a concurrency limit in JavaScript?
```

Claude will use the tool to communicate with the specified model through OpenRouter and present the response.

## Development

- `src/index.ts` - Main entry point
- `src/services/model-service.ts` - Service handling communication with OpenRouter
- `src/types.ts` - TypeScript types
- `src/config/models-config.json` - Configuration (not version controlled)

## License

MIT
