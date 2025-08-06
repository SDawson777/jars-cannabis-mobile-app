import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StoreData } from '../@types/store';
import { useStore } from '../context/StoreContext';

export default function useDeepLinkHandler(stores: StoreData[]) {
  const navigation = useNavigation();
  const { setPreferredStore } = useStore();

  useEffect(() => {
    const handle = (url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.pathname === '/shop') {
          const slug = parsed.searchParams.get('store');
          if (slug) {
            const match = stores.find(
              s => s.slug === slug || s.name.toLowerCase() === slug.toLowerCase()
            );
            if (match) {
              setPreferredStore(match);
              navigation.navigate('ShopScreen' as never);
            }
          }
        }
      } catch (err) {
        // ignore errors from malformed URLs
      }
    };
    const listener = ({ url }: { url: string }) => handle(url);
    Linking.addEventListener('url', listener);
    Linking.getInitialURL().then(u => u && handle(u));
    return () => Linking.removeEventListener('url', listener);
  }, [stores, navigation, setPreferredStore]);
}
