// src/hooks/useDynamicHome.ts
// Dynamic home screen - modular, customizable sections with drag-and-drop

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientPatch, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';
import { useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// Types
// ============================================

export interface HomeSection {
  id: string;
  type: HomeSectionType;
  title: string;
  subtitle?: string;
  position: number;
  visible: boolean;
  collapsible: boolean;
  isCollapsed: boolean;
  config: HomeSectionConfig;
  data?: unknown;
  lastUpdated?: string;
}

export type HomeSectionType = 
  | 'hero_banner'
  | 'featured_products'
  | 'categories'
  | 'deals'
  | 'recently_viewed'
  | 'recommendations'
  | 'favorites'
  | 'quick_reorder'
  | 'loyalty_status'
  | 'active_orders'
  | 'nearby_stores'
  | 'educational_content'
  | 'community_feed'
  | 'weather_recommendations'
  | 'mood_selector'
  | 'upcoming_events'
  | 'strain_of_day'
  | 'custom';

export interface HomeSectionConfig {
  layout?: 'horizontal' | 'grid' | 'list' | 'carousel';
  itemCount?: number;
  showViewAll?: boolean;
  refreshInterval?: number; // seconds
  filters?: Record<string, unknown>;
  customData?: Record<string, unknown>;
}

export interface HomeLayout {
  id: string;
  userId?: string;
  name: string;
  isDefault: boolean;
  sections: HomeSection[];
  theme?: {
    accentColor?: string;
    cardStyle?: 'rounded' | 'square' | 'pill';
  };
  createdAt: string;
  updatedAt: string;
}

export interface SectionTemplate {
  type: HomeSectionType;
  name: string;
  description: string;
  icon: string;
  defaultConfig: HomeSectionConfig;
  previewImage?: string;
}

export interface DragState {
  isDragging: boolean;
  draggedSectionId: string | null;
  dragOverSectionId: string | null;
}

// ============================================
// Home Layout Hooks
// ============================================

/**
 * Hook to fetch home layout
 */
export function useHomeLayout() {
  return useQuery<HomeLayout, Error>({
    queryKey: ['home', 'layout'],
    queryFn: async () => {
      return await clientGet<HomeLayout>(phase4Client, '/home/layout');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch home sections with data
 */
export function useHomeSections() {
  return useQuery<HomeSection[], Error>({
    queryKey: ['home', 'sections'],
    queryFn: async () => {
      const res = await clientGet<{ sections: HomeSection[] }>(
        phase4Client,
        '/home/sections'
      );
      return res.sections;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single section's data
 */
export function useSectionData<T = unknown>(sectionId: string, sectionType: HomeSectionType) {
  return useQuery<T, Error>({
    queryKey: ['home', 'section', sectionId, 'data'],
    queryFn: async () => {
      return await clientGet<T>(
        phase4Client,
        `/home/sections/${sectionId}/data`
      );
    },
    enabled: !!sectionId,
    staleTime: getSectionStaleTime(sectionType),
  });
}

/**
 * Hook to save home layout
 */
export function useSaveHomeLayout() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeLayout, Error, {
    sections: Pick<HomeSection, 'id' | 'position' | 'visible' | 'isCollapsed' | 'config'>[];
    name?: string;
  }>({
    mutationFn: async (layout: {
      sections: Pick<HomeSection, 'id' | 'position' | 'visible' | 'isCollapsed' | 'config'>[];
      name?: string;
    }) => {
      const result = await clientPost<typeof layout, HomeLayout>(
        phase4Client,
        '/home/layout',
        layout
      );
      logEvent('home_layout_saved', { sectionCount: layout.sections.length });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

/**
 * Hook to reset home layout to default
 */
export function useResetHomeLayout() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeLayout, Error, void>({
    mutationFn: async () => {
      const result = await clientPost<Record<string, never>, HomeLayout>(
        phase4Client,
        '/home/layout/reset',
        {}
      );
      logEvent('home_layout_reset', {});
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

// ============================================
// Section Management Hooks
// ============================================

/**
 * Hook to toggle section visibility
 */
export function useToggleSectionVisibility() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { sectionId: string; visible: boolean }>({
    mutationFn: async ({ sectionId, visible }: { sectionId: string; visible: boolean }) => {
      await clientPatch<{ visible: boolean }, void>(
        phase4Client,
        `/home/sections/${sectionId}`,
        { visible }
      );
      logEvent('section_visibility_toggled', { sectionId, visible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

/**
 * Hook to toggle section collapsed state
 */
export function useToggleSectionCollapsed() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { sectionId: string; isCollapsed: boolean }>({
    mutationFn: async ({ sectionId, isCollapsed }: { sectionId: string; isCollapsed: boolean }) => {
      await clientPatch<{ isCollapsed: boolean }, void>(
        phase4Client,
        `/home/sections/${sectionId}`,
        { isCollapsed }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

/**
 * Hook to update section config
 */
export function useUpdateSectionConfig() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeSection, Error, { sectionId: string; config: Partial<HomeSectionConfig> }>({
    mutationFn: async ({ sectionId, config }: { sectionId: string; config: Partial<HomeSectionConfig> }) => {
      const result = await clientPatch<{ config: Partial<HomeSectionConfig> }, HomeSection>(
        phase4Client,
        `/home/sections/${sectionId}`,
        { config }
      );
      logEvent('section_config_updated', { sectionId });
      return result;
    },
    onSuccess: (_: HomeSection, { sectionId }: { sectionId: string; config: Partial<HomeSectionConfig> }) => {
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'section', sectionId] });
    },
  });
}

/**
 * Hook to add a new section
 */
export function useAddSection() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeSection, Error, {
    type: HomeSectionType;
    title: string;
    config?: Partial<HomeSectionConfig>;
    position?: number;
  }>({
    mutationFn: async (section: {
      type: HomeSectionType;
      title: string;
      config?: Partial<HomeSectionConfig>;
      position?: number;
    }) => {
      const result = await clientPost<typeof section, HomeSection>(
        phase4Client,
        '/home/sections',
        section
      );
      logEvent('section_added', { type: section.type });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

/**
 * Hook to remove a section
 */
export function useRemoveSection() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (sectionId: string) => {
      await clientDelete(phase4Client, `/home/sections/${sectionId}`);
      logEvent('section_removed', { sectionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

// ============================================
// Drag and Drop Hooks
// ============================================

/**
 * Hook for drag and drop section reordering
 */
export function useSectionDragDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSectionId: null,
    dragOverSectionId: null,
  });
  
  const [sections, setSections] = useState<HomeSection[]>([]);
  const originalOrderRef = useRef<HomeSection[]>([]);
  
  const startDrag = useCallback((sectionId: string, initialSections: HomeSection[]) => {
    originalOrderRef.current = [...initialSections];
    setSections(initialSections);
    setDragState({
      isDragging: true,
      draggedSectionId: sectionId,
      dragOverSectionId: null,
    });
    logEvent('section_drag_started', { sectionId });
  }, []);
  
  const dragOver = useCallback((targetSectionId: string) => {
    if (dragState.draggedSectionId === targetSectionId) return;
    
    setDragState(prev => ({
      ...prev,
      dragOverSectionId: targetSectionId,
    }));
    
    // Reorder sections during drag
    setSections(prev => {
      const draggedIndex = prev.findIndex(s => s.id === dragState.draggedSectionId);
      const targetIndex = prev.findIndex(s => s.id === targetSectionId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newSections = [...prev];
      const [draggedSection] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedSection);
      
      // Update positions
      return newSections.map((section, index) => ({
        ...section,
        position: index,
      }));
    });
  }, [dragState.draggedSectionId]);
  
  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedSectionId: null,
      dragOverSectionId: null,
    });
  }, []);
  
  const cancelDrag = useCallback(() => {
    setSections(originalOrderRef.current);
    setDragState({
      isDragging: false,
      draggedSectionId: null,
      dragOverSectionId: null,
    });
  }, []);
  
  const getReorderedSections = useCallback(() => {
    return sections.map(s => ({
      id: s.id,
      position: s.position,
      visible: s.visible,
      isCollapsed: s.isCollapsed,
      config: s.config,
    }));
  }, [sections]);
  
  return {
    dragState,
    sections,
    startDrag,
    dragOver,
    endDrag,
    cancelDrag,
    getReorderedSections,
  };
}

// ============================================
// Section Templates Hook
// ============================================

/**
 * Hook to fetch available section templates
 */
export function useSectionTemplates() {
  return useQuery<SectionTemplate[], Error>({
    queryKey: ['home', 'templates'],
    queryFn: async () => {
      const res = await clientGet<{ templates: SectionTemplate[] }>(
        phase4Client,
        '/home/templates'
      );
      return res.templates;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// ============================================
// Saved Layouts Hook
// ============================================

/**
 * Hook to fetch user's saved layouts
 */
export function useSavedLayouts() {
  return useQuery<HomeLayout[], Error>({
    queryKey: ['home', 'layouts', 'saved'],
    queryFn: async () => {
      const res = await clientGet<{ layouts: HomeLayout[] }>(
        phase4Client,
        '/home/layouts'
      );
      return res.layouts;
    },
  });
}

/**
 * Hook to save current layout as a preset
 */
export function useSaveLayoutPreset() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeLayout, Error, { name: string }>({
    mutationFn: async ({ name }: { name: string }) => {
      const result = await clientPost<{ name: string }, HomeLayout>(
        phase4Client,
        '/home/layouts/save',
        { name }
      );
      logEvent('layout_preset_saved', { name });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layouts', 'saved'] });
    },
  });
}

/**
 * Hook to load a saved layout
 */
export function useLoadLayoutPreset() {
  const queryClient = useQueryClient();
  
  return useMutation<HomeLayout, Error, string>({
    mutationFn: async (layoutId: string) => {
      const result = await clientPost<{ layoutId: string }, HomeLayout>(
        phase4Client,
        '/home/layouts/load',
        { layoutId }
      );
      logEvent('layout_preset_loaded', { layoutId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home', 'layout'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'sections'] });
    },
  });
}

// ============================================
// Local Storage for Edit Mode
// ============================================

const EDIT_MODE_KEY = '@nimbus/home_edit_mode';

/**
 * Hook to manage edit mode state
 */
export function useHomeEditMode() {
  const [isEditMode, setIsEditMode] = useState(false);
  
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    logEvent('home_edit_mode_entered', {});
  }, []);
  
  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
    logEvent('home_edit_mode_exited', {});
  }, []);
  
  return {
    isEditMode,
    enterEditMode,
    exitEditMode,
  };
}

// ============================================
// Refresh Section Hook
// ============================================

/**
 * Hook to refresh a specific section
 */
export function useRefreshSection() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (sectionId: string) => {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/home/sections/${sectionId}/refresh`,
        {}
      );
    },
    onSuccess: (_: void, sectionId: string) => {
      queryClient.invalidateQueries({ queryKey: ['home', 'section', sectionId] });
    },
  });
}

// ============================================
// Utility Functions
// ============================================

function getSectionStaleTime(type: HomeSectionType): number {
  switch (type) {
    case 'active_orders':
    case 'loyalty_status':
      return 30 * 1000; // 30 seconds
    case 'deals':
    case 'weather_recommendations':
      return 5 * 60 * 1000; // 5 minutes
    case 'community_feed':
      return 60 * 1000; // 1 minute
    case 'categories':
    case 'nearby_stores':
      return 30 * 60 * 1000; // 30 minutes
    default:
      return 5 * 60 * 1000; // 5 minutes default
  }
}

/**
 * Get default sections for new users
 */
export function getDefaultSections(): Partial<HomeSection>[] {
  return [
    { type: 'hero_banner', position: 0, visible: true },
    { type: 'categories', position: 1, visible: true },
    { type: 'deals', position: 2, visible: true },
    { type: 'recommendations', position: 3, visible: true },
    { type: 'recently_viewed', position: 4, visible: true },
    { type: 'educational_content', position: 5, visible: true },
    { type: 'nearby_stores', position: 6, visible: true },
  ];
}
