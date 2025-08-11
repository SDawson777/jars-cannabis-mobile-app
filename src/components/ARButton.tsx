import { Button } from 'react-native';
import * as Linking from 'expo-linking';

export default function ARButton({ productId }: { productId: string }) {
  return (
    <Button
      title="See it in your space"
      onPress={() =>
        Linking.openURL(`${process.env.EXPO_PUBLIC_API_BASE_URL}/ar/models/${productId}`)
      }
    />
  );
}
