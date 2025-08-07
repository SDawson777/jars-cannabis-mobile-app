import { useEffect, useState } from 'react';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';
import { useCartStore, CartItem } from '../../stores/useCartStore';

export function useCartValidation() {
  const items = useCartStore(state => state.items);
  const setItems = useCartStore(state => state.setItems);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      const updated: CartItem[] = [];
      for (const item of items) {
        try {
          const { data } = await phase4Client.get(`/products/${item.id}`);
          const variant = item.variantId ? data.variants.find((v: any) => v.id === item.variantId) : undefined;
          if (!variant || variant.stock <= 0) {
            updated.push({ ...item, available: false });
            toast(`${item.name} is no longer available`);
          } else {
            if (variant.price !== item.price) {
              toast(`${item.name} price updated`);
            }
            updated.push({ ...item, price: variant.price, available: true });
          }
        } catch {
          toast(`${item.name} was removed`);
          // omit item -> removed from cart
        }
      }
      if (mounted) {
        setItems(updated);
        setValidating(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, []);

  return { validating };
}
