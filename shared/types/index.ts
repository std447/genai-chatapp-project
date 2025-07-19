export const ANONYMOUS_PROMPT_LIMIT = 10;
export const LIMIT_WINDOW_HOURS = 24;

export interface ChatRequest {
  message: string;
  fingerprint?: string;
}

export interface ChatSuccessResponse {
  response: string;
}

export interface ChatErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export interface GroqCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}