import { useEffect, useState } from 'react';

import { useCartStore, CartItem } from '../../stores/useCartStore';
import { phase4Client } from '../api/phase4Client';
import { toast } from '../utils/toast';

export function useCartValidation() {
  const items = useCartStore(_state => _state.items);
  const setItems = useCartStore(_state => _state.setItems);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      const updated: CartItem[] = [];
      for (const item of items) {
        try {
          const { data } = await phase4Client.get(`/products/${item.id}`);
          const variant = item.variantId
            ? data.variants.find((v: any) => v.id === item.variantId)
            : undefined;
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
  }, [items, setItems]);

  return { validating };
}
