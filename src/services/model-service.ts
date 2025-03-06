import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { 
  ModelConfig, 
  ModelsConfig,
  OpenRouterCompletionRequest,
  OpenRouterCompletionResponse
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
  ): Promise<{ text: string; modelUsed: string; usage?: any }> {
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

      // Make API request to Openrouter
      const response = await axios.post<OpenRouterCompletionResponse>(
        modelConfig.endpoint,
        completionRequest,
        {
          headers: {
            'Authorization': `Bearer ${modelConfig.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract and return the response text
      const responseText = response.data.choices[0]?.message?.content || 'No response received';
      
      return {
        text: responseText,
        modelUsed,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error calling external model:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}

export default new ModelService();
