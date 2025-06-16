import type {
  GameStateResponse,
  ProfileResponse,
  LogAttemptResponse,
  HandleWinRequest,
  HandleWinResponse,
  CreditPackResponse,
  PurchaseResponse,
  ApiError,
} from './types';

import supabase from './config/supabaseClient';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Utility function for making API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication token from Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    let errorDetails: ApiError;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = {
        detail: 'An unexpected error occurred',
        status_code: response.status,
      };
    }
    throw new Error(errorDetails.detail || 'API call failed');
  }

  return response.json();
}

// ===================================================================
// Public API Functions (no authentication required)
// ===================================================================

/**
 * Fetches the current public state of the game
 */
export async function getGameState(): Promise<GameStateResponse> {
  return apiCall<GameStateResponse>('/api/v1/game_state');
}

/**
 * Lists all available credit packs for purchase
 */
export async function getCreditPacks(): Promise<CreditPackResponse[]> {
  return apiCall<CreditPackResponse[]>('/api/v1/credit_packs');
}

// ===================================================================
// Authenticated API Functions (require user login)
// ===================================================================

/**
 * Fetches the profile for the currently authenticated user
 */
export async function getMyProfile(): Promise<ProfileResponse> {
  return apiCall<ProfileResponse>('/api/v1/me/profile');
}

/**
 * Logs an attempt and returns the current game state
 */
export async function logAttempt(): Promise<LogAttemptResponse> {
  return apiCall<LogAttemptResponse>('/api/v1/log_attempt', {
    method: 'POST',
  });
}

/**
 * Handles the win condition, logs the chat, and resets the game state
 */
export async function handleWin(winRequest: HandleWinRequest): Promise<HandleWinResponse> {
  return apiCall<HandleWinResponse>('/api/v1/handle_win', {
    method: 'POST',
    body: JSON.stringify(winRequest),
  });
}

/**
 * Handles a credit purchase for a user
 */
export async function purchaseCreditPack(packId: string): Promise<PurchaseResponse> {
  return apiCall<PurchaseResponse>(`/api/v1/credit_packs/${packId}/purchase`, {
    method: 'POST',
  });
}

// ===================================================================
// Utility Functions
// ===================================================================

/**
 * Checks if the user is authenticated by verifying Supabase session
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current Supabase session
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
} 