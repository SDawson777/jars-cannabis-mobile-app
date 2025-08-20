import React from 'react';
import { View, ViewProps } from 'react-native';

type Props = ViewProps & { colors?: string[] };

export default function LinearGradient({ style, children }: Props) {
  return <View style={style}>{children}</View>;
}

