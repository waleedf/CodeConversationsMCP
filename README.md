# Coding Conversations MCP Server

A Model Context Protocol (MCP) server that enables Claude to access external AI models for coding assistance through OpenRouter.

## Features

- Provides two MCP tools:
  - `call_external_model`: Consult external AI models for coding assistance
  - `list_available_models`: Discover available models and their capabilities
- Integrates with OpenAI's GPT-4.1 models (nano, mini, and full versions)
- Includes detailed model metadata (descriptions, use cases, strengths, cost tiers)
- Provides cost estimation for API calls
- Features enhanced error handling with detailed error messages

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
    "nano": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "openai/gpt-4.1-nano",
      "token": "YOUR_OPENROUTER_API_KEY_HERE",
      "metadata": {
        "description": "GPT-4.1 Nano - Smallest and fastest GPT-4.1 variant",
        "useCase": "Quick code reviews, simple debugging tasks, and basic coding assistance",
        "strengths": ["Fast response time", "Cost-effective", "Good for simple tasks"],
        "costTier": "low"
      }
    },
    "mini": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "openai/gpt-4.1-mini",
      "token": "YOUR_OPENROUTER_API_KEY_HERE",
      "metadata": {
        "description": "GPT-4.1 Mini - Mid-sized GPT-4.1 variant with good balance of speed and capability",
        "useCase": "Complex debugging, code optimization, and architectural suggestions",
        "strengths": ["Good balance of speed and capability", "Strong coding knowledge", "Detailed explanations"],
        "costTier": "medium"
      }
    },
    "full": {
      "endpoint": "https://openrouter.ai/api/v1/chat/completions",
      "modelId": "openai/gpt-4.1",
      "token": "YOUR_OPENROUTER_API_KEY_HERE",
      "metadata": {
        "description": "GPT-4.1 - Full-sized GPT-4.1 model with maximum capability",
        "useCase": "Complex system design, advanced debugging, and in-depth code analysis",
        "strengths": ["Most comprehensive understanding", "Best for complex problems", "Detailed and nuanced responses"],
        "costTier": "high"
      }
    }
  },
  "routing": {
    "default_model": "mini"
  }
}
```

You can add additional models by following the same pattern. The `token` field should contain your OpenRouter API key. The `metadata` field is optional but recommended for providing useful information about each model.

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

### Listing Available Models

To see what models are available and their capabilities, ask Claude to use the `list_available_models` tool:

```
Can you use the list_available_models tool to show me what AI models are available for coding assistance?
```

Claude will return a list of available models with their metadata, including descriptions, use cases, strengths, and cost tiers.

### Consulting External Models

Once configured, ask Claude to use the `call_external_model` tool to consult an external model:

```
Can you use the call_external_model tool to ask the mini model about the best way to implement promise.all with a concurrency limit in JavaScript?
```

Claude will use the tool to communicate with the specified model through OpenRouter and present the response.

### Tool Parameters

#### call_external_model

The `call_external_model` tool accepts the following parameters:

- `model` (optional): The model to use (e.g., "nano", "mini", "full"). If not specified, the default model from the configuration will be used.
- `message` (required): The question or problem you want to ask the external model.
- `context` (optional): Additional context about the problem, such as code snippets, error messages, or relevant background information.

#### list_available_models

The `list_available_models` tool doesn't require any parameters.

### Response Format

#### call_external_model

The tool returns a response with the following fields:

- `response`: The text response from the external model.
- `modelUsed`: The name of the model that was used.
- `modelInfo`: Metadata about the model, including description, use case, strengths, and cost tier.
- `usage`: Token usage information.
- `estimatedCost`: Estimated cost of the API call (if available).

#### list_available_models

The tool returns a response with the following fields:

- `models`: A list of available models with their metadata.
- `defaultModel`: The name of the default model.

## Development

- `src/index.ts` - Main entry point and MCP server implementation
- `src/services/model-service.ts` - Service handling communication with OpenRouter
- `src/types.ts` - TypeScript types and interfaces
- `src/config/models-config.json` - Configuration (not version controlled)

### Error Handling

The server includes enhanced error handling with specific error messages for different types of errors:

- Authentication errors (401/403)
- Rate limiting errors (429)
- Server errors (500+)
- General API errors

This makes it easier to diagnose and fix issues when they occur.

### Cost Estimation

The server provides an estimated cost for each API call based on the token usage and approximate pricing for each model. This helps track usage and estimate costs.

## License

MIT
