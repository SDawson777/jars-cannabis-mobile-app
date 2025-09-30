import { useEffect, useState } from 'react';

import { useCartStore, CartItem } from '../../stores/useCartStore';
import { phase4Client } from '../api/phase4Client';
import { clientGet } from '../api/http';
import { toast } from '../utils/toast';
import type { CMSProduct } from '../types/cms';
import type { ProductVariant } from './useProductDetails';

export function useCartValidation() {
  const items = useCartStore((_state: { items: any }) => _state.items);
  const setItems = useCartStore((_state: { setItems: any }) => _state.setItems);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      const updated: CartItem[] = [];
      for (const item of items) {
        try {
          const data = await clientGet<
            { product?: CMSProduct; variants?: ProductVariant[] } | CMSProduct
          >(phase4Client, `/products/${item.id}`);
          const variants: ProductVariant[] =
            (data as any)?.product?.variants ?? (data as any)?.variants ?? [];
          const variant = item.variantId
            ? variants.find((v: ProductVariant) => v.id === item.variantId)
            : variants[0];
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
