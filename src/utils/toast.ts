import { Alert } from 'react-native';

export function toast(message: string) {
  Alert.alert(message);
}
