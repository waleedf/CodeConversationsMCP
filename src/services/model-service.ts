import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { 
  ModelConfig, 
  ModelsConfig,
  OpenRouterCompletionRequest,
  OpenRouterCompletionResponse,
  CallExternalModelOutput
} from '../types';

class ModelService {
  private config: ModelsConfig;

  constructor() {
    try {
      const configPath = path.resolve(__dirname, '../../src/config/models-config.json');
      const configData = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configData) as ModelsConfig;
    } catch (error) {
      console.error('Error loading models configuration:', error);
      throw new Error('Failed to load models configuration');
    }
  }

  /**
   * Get a model configuration by name
   */
  getModelConfig(modelName?: string): ModelConfig {
    if (!modelName) {
      modelName = this.config.routing.default_model;
    }

    const modelConfig = this.config.models[modelName];
    if (!modelConfig) {
      throw new Error(`Model "${modelName}" is not supported`);
    }

    return modelConfig;
  }

  /**
   * Make a request to an external model through Openrouter
   */
  async callExternalModel(
    modelName: string | undefined,
    message: string,
    context?: string
  ): Promise<CallExternalModelOutput> {
    try {
      const modelConfig = this.getModelConfig(modelName);
      const modelUsed = modelName || this.config.routing.default_model;

      // Prepare completion request
      const completionRequest: OpenRouterCompletionRequest = {
        model: modelConfig.modelId,
        messages: [
          {
            role: 'system',
            content: context || 'You are a helpful coding assistant. Provide concise, accurate responses.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

      // Make API request to Openrouter using the model's token
      const response = await axios.post<OpenRouterCompletionResponse>(
        modelConfig.endpoint,
        completionRequest,
        {
          headers: {
            'Authorization': `Bearer ${modelConfig.token}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://coding-conversations-mcp',
            'X-Title': 'Coding Conversations MCP'
          }
        }
      );

      // Extract and return the response text
      const responseText = response.data.choices[0]?.message?.content || 'No response received';
      
      // Calculate approximate cost if usage data is available
      let cost = undefined;
      if (response.data.usage) {
        // Approximate cost calculation based on OpenRouter rates
        // These are rough estimates and should be adjusted based on actual pricing
        const modelRates: Record<string, { input: number; output: number }> = {
          'anthropic/claude-3-opus-20240229': { input: 0.000015, output: 0.000075 },
          'google/gemini-pro': { input: 0.000001, output: 0.000002 }
        };
        
        const rate = modelRates[modelConfig.modelId] || { input: 0.00001, output: 0.00005 };
        const inputCost = (response.data.usage.prompt_tokens || 0) * rate.input;
        const outputCost = (response.data.usage.completion_tokens || 0) * rate.output;
        cost = `$${(inputCost + outputCost).toFixed(6)}`;
      }
      
      return {
        text: responseText,
        modelUsed,
        usage: {
          ...response.data.usage,
          cost
        }
      };
    } catch (error) {
      console.error('Error calling external model:', error);
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error?.message || error.message;
        
        // Provide more helpful error messages based on status code
        if (statusCode === 401 || statusCode === 403) {
          throw new Error(`Authentication error: Invalid API key or insufficient permissions. Details: ${errorMessage}`);
        } else if (statusCode === 429) {
          throw new Error(`Rate limit exceeded: The API request was rate limited. Please try again later.`);
        } else if (statusCode && statusCode >= 500) {
          throw new Error(`OpenRouter server error: The service is currently experiencing issues. Please try again later.`);
        } else {
          throw new Error(`API Error (${statusCode || 'unknown'}): ${errorMessage}`);
        }
      }
      throw error;
    }
  }
}

export default new ModelService();
