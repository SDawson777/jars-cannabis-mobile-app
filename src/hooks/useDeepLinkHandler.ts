import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Linking } from 'react-native';

import type { StoreData } from '../@types/store';
import { useStore } from '../context/StoreContext';
import logger from '../lib/logger';
import { parseDeepLink, isJarsDeepLink } from '../utils/deepLinkUtils';

export default function useDeepLinkHandler(stores: StoreData[]) {
  const navigation = useNavigation();
  const { setPreferredStore } = useStore();

  useEffect(() => {
    const handle = (url: string) => {
      try {
        // Only handle our app's deep links
        if (!isJarsDeepLink(url)) {
          return;
        }

        const parsed = parseDeepLink(url);
        if (!parsed) {
          logger.warn('Could not parse deep link:', { url });
          return;
        }

        const { routeName, params } = parsed;

        // Handle special cases that need additional logic
        switch (routeName) {
          case 'ShopScreen': {
            // Legacy support: check for store parameter
            const storeParam = new URL(url).searchParams.get('store');
            if (storeParam && stores) {
              const match = stores.find(
                s => s.slug === storeParam || s.name.toLowerCase() === storeParam.toLowerCase()
              );
              if (match) {
                setPreferredStore(match);
              }
            }
            (navigation as any).navigate(routeName);
            break;
          }

          case 'ProductDetail':
          case 'ArticleDetail':
          case 'OrderDetails':
          case 'StoreDetails':
          case 'JournalEntry':
          case 'EditAddress':
          case 'EditPayment': {
            // Routes that require parameters
            if (params && Object.keys(params).length > 0) {
              (navigation as any).navigate(routeName, params);
            } else {
              logger.warn(`Route ${routeName} requires parameters but none provided`, {
                routeName,
              });
            }
            break;
          }

          default: {
            // All other routes can be navigated to directly
            if (params && Object.keys(params).length > 0) {
              (navigation as any).navigate(routeName, params);
            } else {
              (navigation as any).navigate(routeName);
            }
            break;
          }
        }
      } catch (error) {
        logger.warn('Error handling deep link:', { url, error });
      }
    };

    const listener = ({ url }: { url: string }) => handle(url);
    const subscription = Linking.addEventListener('url', listener);

    // Handle initial URL if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handle(url);
      }
    });

    return () => subscription.remove();
  }, [stores, navigation, setPreferredStore]);
}
