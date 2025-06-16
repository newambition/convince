import { useState, useEffect, useCallback } from 'react';
import type { 
  GameStateResponse, 
  ProfileResponse, 
  CreditPackResponse,
  ChatMessage 
} from '../types';
import * as api from '../api';

// App-level data state interface
export interface AppData {
  gameState: GameStateResponse | null;
  profile: ProfileResponse | null;
  creditPacks: CreditPackResponse[];
}

// Loading states interface
export interface LoadingStates {
  gameState: boolean;
  profile: boolean;
  creditPacks: boolean;
  chatSubmission: boolean;
}

// Error states interface
export interface ErrorStates {
  gameState: string | null;
  profile: string | null;
  creditPacks: string | null;
  chatSubmission: string | null;
}

export const useAppData = (session: any) => {
  // Backend Data State
  const [appData, setAppData] = useState<AppData>({
    gameState: null,
    profile: null,
    creditPacks: [],
  });
  
  // Loading States
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    gameState: false,
    profile: false,
    creditPacks: false,
    chatSubmission: false,
  });
  
  // Error States
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    gameState: null,
    profile: null,
    creditPacks: null,
    chatSubmission: null,
  });

  // Helper function to update loading state
  const setLoading = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper function to update error state
  const setError = useCallback((key: keyof ErrorStates, value: string | null) => {
    setErrorStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Fetch game state (public data, no auth required)
  const fetchGameState = useCallback(async () => {
    setLoading('gameState', true);
    setError('gameState', null);
    try {
      const gameState = await api.getGameState();
      setAppData(prev => ({ ...prev, gameState }));
    } catch (error) {
      setError('gameState', error instanceof Error ? error.message : 'Failed to fetch game state');
    } finally {
      setLoading('gameState', false);
    }
  }, [setLoading, setError]);

  // Fetch user profile (requires authentication)
  const fetchProfile = useCallback(async () => {
    if (!session) return;
    
    setLoading('profile', true);
    setError('profile', null);
    try {
      const profile = await api.getMyProfile();
      setAppData(prev => ({ ...prev, profile }));
    } catch (error) {
      setError('profile', error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setLoading('profile', false);
    }
  }, [session, setLoading, setError]);

  // Fetch credit packs (public data)
  const fetchCreditPacks = useCallback(async () => {
    setLoading('creditPacks', true);
    setError('creditPacks', null);
    try {
      const creditPacks = await api.getCreditPacks();
      setAppData(prev => ({ ...prev, creditPacks }));
    } catch (error) {
      setError('creditPacks', error instanceof Error ? error.message : 'Failed to fetch credit packs');
    } finally {
      setLoading('creditPacks', false);
    }
  }, [setLoading, setError]);

  // Log attempt when user sends a message
  const logAttempt = useCallback(async () => {
    if (!session) return;
    
    try {
      const result = await api.logAttempt();
      // Update game state based on the response (but don't expose payout phase to UI)
      setAppData(prev => ({
        ...prev,
        gameState: prev.gameState ? {
          ...prev.gameState,
          is_payout_phase_active: result.is_payout_phase_active
        } : null
      }));
      
      // Refresh profile to get updated credits after attempt
      await fetchProfile();
      
      // Don't return payout phase status to frontend
    } catch (error) {
      console.error('Failed to log attempt:', error);
    }
  }, [session, fetchProfile]);

  // Handle win submission
  const handleWinSubmission = useCallback(async (chatLog: ChatMessage[]) => {
    if (!session) return;
    
    setLoading('chatSubmission', true);
    setError('chatSubmission', null);
    try {
      const result = await api.handleWin({ chat_log: chatLog });
      console.log('Win handled successfully:', result);
      // Refresh game state and profile after win
      await Promise.all([fetchGameState(), fetchProfile()]);
      return result;
    } catch (error) {
      setError('chatSubmission', error instanceof Error ? error.message : 'Failed to handle win');
      throw error;
    } finally {
      setLoading('chatSubmission', false);
    }
  }, [session, setLoading, setError, fetchGameState, fetchProfile]);

  // Purchase credit pack
  const purchaseCreditPack = useCallback(async (packId: string) => {
    if (!session) return;
    
    try {
      const result = await api.purchaseCreditPack(packId);
      // Refresh profile to get updated credits
      await fetchProfile();
      return result;
    } catch (error) {
      console.error('Failed to purchase credit pack:', error);
      throw error;
    }
  }, [session, fetchProfile]);

  // Initial data fetching - public data
  useEffect(() => {
    fetchGameState();
    fetchCreditPacks();
  }, [fetchGameState, fetchCreditPacks]);

  // Fetch user-specific data when session changes
  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      // Clear user-specific data when logged out
      setAppData(prev => ({ ...prev, profile: null }));
    }
  }, [session, fetchProfile]);

  return {
    appData,
    loadingStates,
    errorStates,
    actions: {
      fetchGameState,
      fetchProfile,
      fetchCreditPacks,
      logAttempt,
      handleWinSubmission,
      purchaseCreditPack,
    }
  };
}; 