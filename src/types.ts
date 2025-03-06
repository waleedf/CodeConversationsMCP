/**
 * Types for the CodingConversationsMCP server
 */

// Configuration types
export interface ModelConfig {
  endpoint: string;
  modelId: string;
  token: string;
}

export interface ModelsConfig {
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
  response: string;
  modelUsed: string;
  usage?: {
    tokens?: number;
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
