import React from 'react';
import { View, ViewProps } from 'react-native';

export default function PagerView({ children, style }: ViewProps & any) {
  return <View style={style}>{children}</View>;
}
