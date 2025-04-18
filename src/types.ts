/**
 * Types for the CodingConversationsMCP server
 */

// Configuration types
export interface ModelConfig {
  endpoint: string;
  modelId: string;
  token: string;
  metadata?: {
    description?: string;
    useCase?: string;
    strengths?: string[];
    costTier?: 'low' | 'medium' | 'high';
  };
}

export interface ModelsConfig {
  openrouterApiKey: string;
  models: {
    [key: string]: ModelConfig;
  };
  routing: {
    default_model: string;
  };
}

// Input/Output types for the MCP tool
export interface CallExternalModelInput {
  model?: string;
  message: string;
  context?: string;
}

export interface CallExternalModelOutput {
  text: string;
  modelUsed: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: string;
  };
}

// Openrouter API types
export interface OpenRouterCompletionRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
