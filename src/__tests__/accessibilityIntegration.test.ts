import { renderHook } from '@testing-library/react-native';
import { useAccessibilityStore } from '../state/accessibilityStore';
import { useTextScaling } from '../hooks/useTextScaling';

describe('Accessibility Integration', () => {
  beforeEach(() => {
    // Reset store state
    useAccessibilityStore.getState().setTextSize('md');
    useAccessibilityStore.getState().setHighContrast(false);
    useAccessibilityStore.getState().setReduceMotion(false);
  });

  it('integrates text scaling with accessibility store', () => {
    const store = useAccessibilityStore.getState();

    // Change text size to large
    store.setTextSize('lg');

    // Text scaling should reflect the change
    const { result } = renderHook(() => useTextScaling());
    expect(result.current.scaleFactor).toBe(1.125);
    expect(result.current.scaleSize(16)).toBe(18);
  });

  it('handles all accessibility settings together', () => {
    const store = useAccessibilityStore.getState();

    // Enable all accessibility features
    store.setTextSize('xl');
    store.setHighContrast(true);
    store.setReduceMotion(true);

    // Get fresh state
    const currentState = useAccessibilityStore.getState();

    // Verify state
    expect(currentState.textSize).toBe('xl');
    expect(currentState.highContrast).toBe(true);
    expect(currentState.reduceMotion).toBe(true);

    // Verify text scaling still works
    const { result } = renderHook(() => useTextScaling());
    expect(result.current.scaleFactor).toBe(1.25);
  });

  it('persists and hydrates settings correctly', () => {
    const store = useAccessibilityStore.getState();

    // Set some values
    store.setTextSize('lg');
    store.setHighContrast(true);

    // Simulate app restart by hydrating with saved data
    const savedSettings = {
      textSize: 'sm' as const,
      highContrast: false,
      reduceMotion: true,
    };

    store.hydrate(savedSettings);

    // Get fresh state after hydration
    const currentState = useAccessibilityStore.getState();

    // Verify hydrated values
    expect(currentState.textSize).toBe('sm');
    expect(currentState.highContrast).toBe(false);
    expect(currentState.reduceMotion).toBe(true);
  });
});
