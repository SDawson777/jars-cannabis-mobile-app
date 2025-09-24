import { useAccessibilityStore } from '../state/accessibilityStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('accessibilityStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useAccessibilityStore.setState({
      textSize: 'md',
      highContrast: false,
      reduceMotion: false,
    });
  });

  it('has correct initial state', () => {
    const store = useAccessibilityStore.getState();

    expect(store.textSize).toBe('md');
    expect(store.highContrast).toBe(false);
    expect(store.reduceMotion).toBe(false);
  });

  it('updates text size correctly', () => {
    const { setTextSize } = useAccessibilityStore.getState();

    setTextSize('lg');

    expect(useAccessibilityStore.getState().textSize).toBe('lg');
  });

  it('updates high contrast correctly', () => {
    const { setHighContrast } = useAccessibilityStore.getState();

    setHighContrast(true);

    expect(useAccessibilityStore.getState().highContrast).toBe(true);
  });

  it('updates reduce motion correctly', () => {
    const { setReduceMotion } = useAccessibilityStore.getState();

    setReduceMotion(true);

    expect(useAccessibilityStore.getState().reduceMotion).toBe(true);
  });

  it('hydrates state from provided data', () => {
    const { hydrate } = useAccessibilityStore.getState();

    const savedState = {
      textSize: 'xl' as const,
      highContrast: true,
      reduceMotion: true,
    };

    hydrate(savedState);

    const store = useAccessibilityStore.getState();
    expect(store.textSize).toBe('xl');
    expect(store.highContrast).toBe(true);
    expect(store.reduceMotion).toBe(true);
  });

  it('ignores invalid textSize during hydration', () => {
    const { hydrate } = useAccessibilityStore.getState();

    const invalidState = {
      textSize: 'invalid' as any,
      highContrast: true,
      reduceMotion: false,
    };

    hydrate(invalidState);

    const store = useAccessibilityStore.getState();
    expect(store.textSize).toBe('md'); // Should remain default
    expect(store.highContrast).toBe(true); // Should be updated
    expect(store.reduceMotion).toBe(false); // Should be updated
  });

  it('handles partial hydration data', () => {
    const { hydrate } = useAccessibilityStore.getState();

    const partialState = {
      highContrast: true,
      // Missing textSize and reduceMotion
    };

    hydrate(partialState as any);

    const store = useAccessibilityStore.getState();
    expect(store.textSize).toBe('md'); // Should remain default
    expect(store.highContrast).toBe(true); // Should be updated
    expect(store.reduceMotion).toBe(false); // Should remain default
  });

  it('validates textSize values', () => {
    const { setTextSize } = useAccessibilityStore.getState();

    // Valid values
    const validSizes = ['system', 'sm', 'md', 'lg', 'xl'] as const;

    validSizes.forEach(size => {
      setTextSize(size);
      expect(useAccessibilityStore.getState().textSize).toBe(size);
    });
  });
});
