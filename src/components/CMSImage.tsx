import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface Props {
  uri: string;
  alt?: string;
  aspectRatio?: number;
  style?: ImageStyle;
}

export default function CMSImage({ uri, alt, aspectRatio, style }: Props) {
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={alt}
      style={[{ width: '100%', aspectRatio }, style]}
      resizeMode="cover"
      progressiveRenderingEnabled
    />
  );
}
