import type { SharedValue } from 'react-native-reanimated';
import { withTiming, Easing } from 'react-native-reanimated';

export function bounce(value: SharedValue<number>, to: number = 1, duration = 300) {
  value.value = withTiming(to, { duration, easing: Easing.out(Easing.exp) });
}

export function fadeInUp(opacity: SharedValue<number>, translateY: SharedValue<number>) {
  opacity.value = 0;
  translateY.value = 20;
  opacity.value = withTiming(1, { duration: 300 });
  translateY.value = withTiming(0, { duration: 300 });
}
