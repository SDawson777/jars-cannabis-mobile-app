import * as Linking from 'expo-linking';
import { Button } from 'react-native';

import { API_BASE_URL } from '../utils/apiConfig';

export default function ARButton({ productId }: { productId: string }) {
  return (
    <Button
      title="See it in your space"
      onPress={() => Linking.openURL(`${API_BASE_URL}/ar/models/${productId}`)}
    />
  );
}
