export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isWinning?: boolean;
}

// ===================================================================
// Backend API Types - Matching schemas/game.py
// ===================================================================

// Request Models (Data sent TO the API)
export interface ChatMessage {
  prompt: string;
  response: string;
}

export interface HandleWinRequest {
  chat_log: ChatMessage[];
}

// Response Models (Data sent FROM the API)
export interface LogAttemptResponse {
  is_payout_phase_active: boolean;
}

export interface HandleWinResponse {
  status: string;
  win_id: string; // UUID as string in TypeScript
}

export interface ProfileResponse {
  id: string; // UUID as string in TypeScript
  username?: string | null;
  avatar_url?: string | null;
  credits: number;
}

export interface GameStateResponse {
  prizepool_amount: number;
  is_payout_phase_active: boolean;
}

export interface CreditPackResponse {
  id: string; // UUID as string in TypeScript
  name: string;
  credits_amount: number;
  price: number;
}

export interface PurchaseResponse {
  status: string;
  purchase_id: string; // UUID as string in TypeScript
  new_credits_balance: number;
}

// Additional utility types for API calls
export interface ApiError {
  detail: string;
  status_code?: number;
}
