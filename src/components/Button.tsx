import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  AccessibilityRole,
} from 'react-native';
import { hapticLight } from '../utils/haptic';

interface Props {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: Props) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handleIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handleOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };
  const handlePress = () => {
    hapticLight();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        style={[styles.button, style]}
      >
        <Text allowFontScaling style={[styles.text, textStyle]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
  },
});
