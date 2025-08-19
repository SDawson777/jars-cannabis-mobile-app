import React from 'react';
import { View, ViewProps } from 'react-native';

export default function MapView({ style, children }: ViewProps & any) {
  return <View style={[{ backgroundColor: '#DDD' }, style]}>{children}</View>;
}

export const Marker = ({ children }: any) => <View>{children}</View>;
export type Region = any;

