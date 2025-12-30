import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_COMPLETED = 'onboardingCompleted';
const KEY_LAST_INDEX = 'onboardingLastIndex';

export function useOnboardingProgress() {
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [lastIndex, setLastIndexState] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [c, idx] = await Promise.all([
          AsyncStorage.getItem(KEY_COMPLETED),
          AsyncStorage.getItem(KEY_LAST_INDEX),
        ]);
        if (!mounted) return;
        setCompleted(c === 'true');
        setLastIndexState(idx ? Number(idx) : 0);
      } catch (_e) {
        // swallow – non-critical
        if (!mounted) return;
        setCompleted(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLastIndex = useCallback(async (i: number) => {
    try {
      setLastIndexState(i);
      await AsyncStorage.setItem(KEY_LAST_INDEX, String(i));
    } catch (_e) {
      // ignore storage errors
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setCompleted(true);
      await AsyncStorage.setItem(KEY_COMPLETED, 'true');
    } catch (_e) {
      // ignore
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      setCompleted(false);
      setLastIndexState(0);
      await Promise.all([
        AsyncStorage.removeItem(KEY_COMPLETED),
        AsyncStorage.removeItem(KEY_LAST_INDEX),
      ]);
    } catch (_e) {
      // ignore
    }
  }, []);

  return {
    completed,
    lastIndex,
    setLastIndex,
    completeOnboarding,
    resetOnboarding,
  } as const;
}

export default useOnboardingProgress;
