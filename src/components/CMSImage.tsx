import React from 'react';
import { Image as ExpoImage } from 'expo-image';
import { ImageStyle, StyleProp } from 'react-native';

interface Props {
  uri: string;
  alt?: string;
  aspectRatio?: number;
  style?: StyleProp<ImageStyle>;
}

// Blurhash placeholder for loading state (neutral gray)
const PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

/**
 * Optimized image component using expo-image for:
 * - Aggressive disk and memory caching
 * - Blurhash placeholder during load
 * - Progressive loading
 * - Better performance than React Native Image
 */
export default function CMSImage({ uri, alt, aspectRatio, style }: Props) {
  return (
    <ExpoImage
      source={{ uri }}
      alt={alt}
      style={[{ width: '100%', aspectRatio }, style]}
      contentFit="cover"
      transition={200}
      placeholder={PLACEHOLDER_BLURHASH}
      cachePolicy="memory-disk"
      recyclingKey={uri}
    />
  );
}
