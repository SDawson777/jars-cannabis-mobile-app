import React from 'react';
import { View } from 'react-native';

export default function ContextualIcon({ name, size = 24 }: { name: string; size?: number }) {
  try {
    const Icon = require(`../../assets/icons/for-you/${name}.svg`).default;
    return <Icon width={size} height={size} testID={`context-icon-${name}`} />;
  } catch {
    return <View style={{ width: size, height: size }} />;
  }
}
