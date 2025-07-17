export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
}

export interface ChatCompletionResponse {
  message: ChatMessage;
  cached?: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RateLimitData {
  count: number;
  lastReset: number;
}

export interface Env {
  GROQ_API_KEY: string;
  FIREBASE_PUBLIC_KEYS_URL: string;
  FIREBASE_PROJECT_ID: string;
  KV_STORE: unknown;
}

export interface ModerationResponse {
  isSafe: boolean;
  categories?: string[];
  reason?: string;
}

export interface FirebaseIdTokenPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  firebase: {
    sign_in_provider: string;
    identities: {
      [key: string]: string[];
    };
  };
  [key: string]: any;
}