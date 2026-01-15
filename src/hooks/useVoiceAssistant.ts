// src/hooks/useVoiceAssistant.ts
// Voice & chat assistant - voice search, ordering via Siri/Google Assistant

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';
import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// Web Speech API Types (for cross-platform compatibility)
// ============================================

// Extend globalThis for browser APIs that may not be available in React Native
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    speechSynthesis?: SpeechSynthesis;
  }
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechSynthesis {
  speaking: boolean;
  cancel: () => void;
  speak: (utterance: SpeechSynthesisUtterance) => void;
  getVoices: () => SpeechSynthesisVoice[];
}

interface SpeechSynthesisUtterance {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  voice: SpeechSynthesisVoice | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechSynthesisUtteranceConstructor {
  new (text: string): SpeechSynthesisUtterance;
}

interface SpeechSynthesisVoice {
  name: string;
  lang: string;
}

// ============================================
// Types
// ============================================

export interface VoiceCommand {
  id: string;
  transcript: string;
  intent: VoiceIntent;
  entities: Record<string, string | number | string[]>;
  confidence: number;
  response: VoiceResponse;
  createdAt: string;
}

export type VoiceIntent = 
  | 'search_products'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'checkout'
  | 'reorder'
  | 'track_order'
  | 'store_hours'
  | 'store_location'
  | 'product_info'
  | 'strain_effects'
  | 'recommendation'
  | 'help'
  | 'unknown';

export interface VoiceResponse {
  text: string;
  ssml?: string;
  displayData?: {
    type: 'products' | 'cart' | 'order' | 'store' | 'text';
    data: unknown;
  };
  actions?: VoiceAction[];
  followUp?: string;
}

export interface VoiceAction {
  type: 'navigate' | 'add_to_cart' | 'checkout' | 'call' | 'open_url';
  label: string;
  payload: Record<string, unknown>;
}

export interface VoiceSettings {
  enabled: boolean;
  wakeWord: 'hey_nimbus' | 'nimbus' | 'none';
  language: string;
  voiceId: string;
  speakResponses: boolean;
  confirmOrders: boolean;
  shortcuts: VoiceShortcut[];
}

export interface VoiceShortcut {
  id: string;
  phrase: string;
  action: VoiceAction;
  enabled: boolean;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export interface SiriShortcut {
  id: string;
  title: string;
  phrase: string;
  activityType: string;
  isActive: boolean;
}

export interface GoogleAssistantAction {
  id: string;
  name: string;
  actionId: string;
  parameters: Record<string, unknown>;
  isEnabled: boolean;
}

// ============================================
// Voice Command Hooks
// ============================================

/**
 * Hook to process a voice command
 */
export function useProcessVoiceCommand() {
  const queryClient = useQueryClient();
  
  return useMutation<VoiceCommand, Error, {
    transcript: string;
    context?: {
      currentScreen?: string;
      cartId?: string;
      storeId?: string;
    };
  }>({
    mutationFn: async (input: {
      transcript: string;
      context?: {
        currentScreen?: string;
        cartId?: string;
        storeId?: string;
      };
    }) => {
      const result = await clientPost<typeof input, VoiceCommand>(
        phase4Client,
        '/voice/process',
        input
      );
      logEvent('voice_command_processed', {
        intent: result.intent,
        confidence: result.confidence,
      });
      return result;
    },
    onSuccess: (data: VoiceCommand) => {
      // Invalidate relevant queries based on intent
      if (data.intent === 'add_to_cart' || data.intent === 'remove_from_cart') {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
}

/**
 * Hook to fetch command history
 */
export function useVoiceCommandHistory() {
  return useQuery<VoiceCommand[], Error>({
    queryKey: ['voice', 'history'],
    queryFn: async () => {
      const res = await clientGet<{ commands: VoiceCommand[] }>(
        phase4Client,
        '/voice/history'
      );
      return res.commands;
    },
  });
}

// ============================================
// Voice Recognition Hook (Native)
// ============================================

// Type definitions for voice recognition (platform-agnostic)
interface VoiceRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { [index: number]: { [index: number]: { transcript: string; confidence: number }; isFinal: boolean }; length: number } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/**
 * Hook for voice recognition using Web Speech API or native modules
 * In React Native, this would use @react-native-voice/voice or expo-speech
 */
export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0,
  });
  
  const recognitionRef = useRef<VoiceRecognitionInstance | null>(null);
  
  useEffect(() => {
    // Initialize Web Speech API (for web) or native module (for React Native)
    // In React Native, you would use @react-native-voice/voice instead
    const globalWindow = typeof globalThis !== 'undefined' ? globalThis as unknown as Record<string, unknown> : null;
    if (globalWindow && ('SpeechRecognition' in globalWindow || 'webkitSpeechRecognition' in globalWindow)) {
      const SpeechRecognitionClass = (globalWindow.SpeechRecognition || globalWindow.webkitSpeechRecognition) as { new(): VoiceRecognitionInstance } | undefined;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setState(prev => ({
            ...prev,
            transcript: finalTranscript || prev.transcript,
            interimTranscript,
            confidence: event.results[0]?.[0]?.confidence || 0,
          }));
        };
        
        recognition.onerror = (event) => {
          setState(prev => ({
            ...prev,
            error: event.error,
            isListening: false,
          }));
        };
        
        recognition.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setState(prev => ({
        ...prev,
        isListening: true,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));
      recognitionRef.current.start();
      logEvent('voice_listening_started', {});
    } else {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition not supported',
      }));
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      logEvent('voice_listening_stopped', {});
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);
  
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
    }));
  }, []);
  
  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognitionRef.current,
  };
}

// ============================================
// Text-to-Speech Hook
// ============================================

// Type definitions for speech synthesis (platform-agnostic)
interface SpeechSynthesisInstance {
  cancel: () => void;
  speak: (utterance: SpeechUtteranceInstance) => void;
  getVoices: () => Array<{ name: string }>;
}

interface SpeechUtteranceInstance {
  lang: string;
  rate: number;
  pitch: number;
  voice: { name: string } | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

/**
 * Hook for text-to-speech
 * In React Native, this would use expo-speech or react-native-tts
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisInstance | null>(null);
  const utteranceRef = useRef<SpeechUtteranceInstance | null>(null);
  
  useEffect(() => {
    const globalWindow = typeof globalThis !== 'undefined' ? globalThis as unknown as Record<string, unknown> : null;
    if (globalWindow && 'speechSynthesis' in globalWindow) {
      synthRef.current = globalWindow.speechSynthesis as SpeechSynthesisInstance;
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  const speak = useCallback((text: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    voice?: string;
  }) => {
    if (!synthRef.current) return;
    
    const synth = synthRef.current;
    // Cancel any ongoing speech
    synth.cancel();
    
    // In a browser environment, create SpeechSynthesisUtterance
    // In React Native, you would use expo-speech.speak() instead
    const globalWindow = typeof globalThis !== 'undefined' ? globalThis as unknown as Record<string, unknown> : null;
    const SpeechUtteranceClass = globalWindow?.SpeechSynthesisUtterance as { new(text: string): SpeechUtteranceInstance } | undefined;
    
    if (SpeechUtteranceClass) {
      const utterance = new SpeechUtteranceClass(text);
      utterance.lang = options?.lang || 'en-US';
      utterance.rate = options?.rate || 1;
      utterance.pitch = options?.pitch || 1;
      
      if (options?.voice) {
        const voices = synth.getVoices();
        const selectedVoice = voices.find((v: { name: string }) => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      utteranceRef.current = utterance;
      synth.speak(utterance);
    }
  }, []);
  
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);
  
  const getVoices = useCallback(() => {
    if (synthRef.current) {
      return synthRef.current.getVoices();
    }
    return [];
  }, []);
  
  return {
    speak,
    stop,
    getVoices,
    isSpeaking,
    isSupported: !!synthRef.current,
  };
}

// ============================================
// Voice Settings Hooks
// ============================================

/**
 * Hook to fetch voice settings
 */
export function useVoiceSettings() {
  return useQuery<VoiceSettings, Error>({
    queryKey: ['voice', 'settings'],
    queryFn: async () => {
      return await clientGet<VoiceSettings>(phase4Client, '/voice/settings');
    },
  });
}

/**
 * Hook to update voice settings
 */
export function useUpdateVoiceSettings() {
  const queryClient = useQueryClient();
  
  return useMutation<VoiceSettings, Error, Partial<VoiceSettings>>({
    mutationFn: async (settings: Partial<VoiceSettings>) => {
      const result = await clientPost<Partial<VoiceSettings>, VoiceSettings>(
        phase4Client,
        '/voice/settings',
        settings
      );
      logEvent('voice_settings_updated', { fields: Object.keys(settings) });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice', 'settings'] });
    },
  });
}

// ============================================
// Siri Shortcuts Hooks (iOS)
// ============================================

/**
 * Hook to fetch Siri shortcuts
 */
export function useSiriShortcuts() {
  return useQuery<SiriShortcut[], Error>({
    queryKey: ['voice', 'siri', 'shortcuts'],
    queryFn: async () => {
      const res = await clientGet<{ shortcuts: SiriShortcut[] }>(
        phase4Client,
        '/voice/siri/shortcuts'
      );
      return res.shortcuts;
    },
  });
}

/**
 * Hook to create a Siri shortcut
 */
export function useCreateSiriShortcut() {
  const queryClient = useQueryClient();
  
  return useMutation<SiriShortcut, Error, {
    title: string;
    phrase: string;
    activityType: string;
  }>({
    mutationFn: async (shortcut: {
      title: string;
      phrase: string;
      activityType: string;
    }) => {
      const result = await clientPost<typeof shortcut, SiriShortcut>(
        phase4Client,
        '/voice/siri/shortcuts',
        shortcut
      );
      logEvent('siri_shortcut_created', { activityType: shortcut.activityType });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice', 'siri', 'shortcuts'] });
    },
  });
}

/**
 * Hook to suggest a Siri shortcut to the user
 */
export function useSuggestSiriShortcut() {
  return useMutation<{ suggested: boolean }, Error, SiriShortcut>({
    mutationFn: async (shortcut: SiriShortcut) => {
      // This would call native iOS APIs to suggest the shortcut
      const result = await clientPost<{ shortcutId: string }, { suggested: boolean }>(
        phase4Client,
        '/voice/siri/suggest',
        { shortcutId: shortcut.id }
      );
      logEvent('siri_shortcut_suggested', { shortcutId: shortcut.id });
      return result;
    },
  });
}

// ============================================
// Google Assistant Hooks (Android)
// ============================================

/**
 * Hook to fetch Google Assistant actions
 */
export function useGoogleAssistantActions() {
  return useQuery<GoogleAssistantAction[], Error>({
    queryKey: ['voice', 'google', 'actions'],
    queryFn: async () => {
      const res = await clientGet<{ actions: GoogleAssistantAction[] }>(
        phase4Client,
        '/voice/google/actions'
      );
      return res.actions;
    },
  });
}

/**
 * Hook to register a Google Assistant action
 */
export function useRegisterGoogleAction() {
  const queryClient = useQueryClient();
  
  return useMutation<GoogleAssistantAction, Error, {
    name: string;
    actionId: string;
    parameters: Record<string, unknown>;
  }>({
    mutationFn: async (action: {
      name: string;
      actionId: string;
      parameters: Record<string, unknown>;
    }) => {
      const result = await clientPost<typeof action, GoogleAssistantAction>(
        phase4Client,
        '/voice/google/actions',
        action
      );
      logEvent('google_action_registered', { actionId: action.actionId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice', 'google', 'actions'] });
    },
  });
}

// ============================================
// Voice Search Hook
// ============================================

/**
 * Hook for voice-powered product search
 */
export function useVoiceSearch() {
  const voiceRecognition = useVoiceRecognition();
  const processCommand = useProcessVoiceCommand();
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  
  const search = useCallback(async () => {
    if (voiceRecognition.transcript) {
      const result = await processCommand.mutateAsync({
        transcript: voiceRecognition.transcript,
        context: { currentScreen: 'search' },
      });
      
      if (result.response.displayData?.type === 'products') {
        setSearchResults(result.response.displayData.data as unknown[]);
      }
    }
  }, [voiceRecognition.transcript, processCommand]);
  
  return {
    ...voiceRecognition,
    search,
    searchResults,
    isSearching: processCommand.isPending,
  };
}

// ============================================
// Voice Ordering Hook
// ============================================

/**
 * Hook for voice-powered ordering
 */
export function useVoiceOrdering() {
  const processCommand = useProcessVoiceCommand();
  const [lastAction, setLastAction] = useState<VoiceAction | null>(null);
  
  const executeCommand = useCallback(async (transcript: string, context?: {
    cartId?: string;
    storeId?: string;
  }) => {
    const result = await processCommand.mutateAsync({
      transcript,
      context,
    });
    
    if (result.response.actions && result.response.actions.length > 0) {
      setLastAction(result.response.actions[0]);
    }
    
    return result;
  }, [processCommand]);
  
  return {
    executeCommand,
    lastAction,
    isPending: processCommand.isPending,
    error: processCommand.error,
  };
}
