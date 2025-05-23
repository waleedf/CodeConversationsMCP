#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import modelService from './services/model-service';
import { CallExternalModelInput } from './types';

class CodingConversationsMCP {
  private server: Server;

  constructor() {
    // Initialize the MCP server
    this.server = new Server(
      {
        name: 'coding-conversations-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up request handlers
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    // Handle termination
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Set up MCP tool handlers
   */
  private setupToolHandlers() {
    // List tools request handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'call_external_model',
          description: 'When you hit a debugging roadblock or need a second opinion on code issues, consult external AI models. Use this for complex error debugging, optimization advice, or exploring alternative approaches to coding problems.',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: 'Target model name (e.g., "nano", "mini", "full"). "nano" is fastest and most cost-effective for simple tasks, "mini" balances speed and capability for most coding tasks, and "full" is best for complex problems requiring deep analysis.',
              },
              message: {
                type: 'string',
                description: 'The specific debug error, coding issue, or question you need help with. Be specific about your debugging challenge or the alternative approach you seek.',
              },
              context: {
                type: 'string',
                description: 'Additional context about your debugging scenario, such as relevant code snippets, error messages, or the programming language/framework you\'re using.',
              },
            },
            required: ['message'],
          },
        }
      ],
    }));

    // Call tool request handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'call_external_model') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      // Validate and parse input parameters
      const args = request.params.arguments as Record<string, unknown>;
      
      if (typeof args.message !== 'string' || !args.message) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Missing or invalid required parameter: message'
        );
      }
      
      // Now that we've validated, we can create a properly typed object
      const params: CallExternalModelInput = {
        message: args.message,
        model: typeof args.model === 'string' ? args.model : undefined,
        context: typeof args.context === 'string' ? args.context : undefined
      };

      try {
        // Call the external model
        const result = await modelService.callExternalModel(
          params.model,
          params.message,
          params.context
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                response: result.text,
                modelUsed: result.modelUsed,
                usage: result.usage
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error('Error processing request:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CodingConversationsMCP server running on stdio');
  }
}

// Create and start the server
const server = new CodingConversationsMCP();
server.run().catch(console.error);
