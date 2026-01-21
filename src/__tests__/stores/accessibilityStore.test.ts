/**
 * @jest-environment jsdom
 */

import { act } from '@testing-library/react-native';

import { useAccessibilityStore } from '../../state/accessibilityStore';

describe('accessibilityStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useAccessibilityStore.setState({
        textSize: 'system',
        highContrast: false,
        reduceMotion: false,
      });
    });
  });

  it('has initial textSize of system', () => {
    const { textSize } = useAccessibilityStore.getState();
    expect(textSize).toBe('system');
  });

  it('has initial highContrast false', () => {
    const { highContrast } = useAccessibilityStore.getState();
    expect(highContrast).toBe(false);
  });

  it('has initial reduceMotion false', () => {
    const { reduceMotion } = useAccessibilityStore.getState();
    expect(reduceMotion).toBe(false);
  });

  it('setTextSize updates text size', () => {
    const { setTextSize } = useAccessibilityStore.getState();

    act(() => {
      setTextSize('lg');
    });

    expect(useAccessibilityStore.getState().textSize).toBe('lg');
  });

  it('setHighContrast enables high contrast', () => {
    const { setHighContrast } = useAccessibilityStore.getState();

    act(() => {
      setHighContrast(true);
    });

    expect(useAccessibilityStore.getState().highContrast).toBe(true);
  });

  it('setReduceMotion enables reduce motion', () => {
    const { setReduceMotion } = useAccessibilityStore.getState();

    act(() => {
      setReduceMotion(true);
    });

    expect(useAccessibilityStore.getState().reduceMotion).toBe(true);
  });

  it('hydrate sets all settings', () => {
    const { hydrate } = useAccessibilityStore.getState();

    act(() => {
      hydrate({
        textSize: 'xl',
        highContrast: true,
        reduceMotion: true,
      });
    });

    const state = useAccessibilityStore.getState();
    expect(state.textSize).toBe('xl');
    expect(state.highContrast).toBe(true);
    expect(state.reduceMotion).toBe(true);
  });

  it('hydrate uses default for invalid textSize', () => {
    const { hydrate } = useAccessibilityStore.getState();

    act(() => {
      hydrate({
        textSize: 'invalid' as any,
        highContrast: false,
        reduceMotion: false,
      });
    });

    expect(useAccessibilityStore.getState().textSize).toBe('md');
  });

  it('hydrate uses false for undefined highContrast', () => {
    const { hydrate } = useAccessibilityStore.getState();

    act(() => {
      hydrate({
        textSize: 'lg',
        highContrast: undefined as any,
        reduceMotion: false,
      });
    });

    expect(useAccessibilityStore.getState().highContrast).toBe(false);
  });

  it('accepts all valid text size values', () => {
    const { setTextSize } = useAccessibilityStore.getState();
    const validSizes = ['system', 'sm', 'md', 'lg', 'xl'] as const;

    for (const size of validSizes) {
      act(() => {
        setTextSize(size);
      });
      expect(useAccessibilityStore.getState().textSize).toBe(size);
    }
  });
});
