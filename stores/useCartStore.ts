import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  available?: boolean;
  image?: string;
}

interface CartState {
  items: CartItem[];
  appliedCoupon?: string;
  addItem: (_item: CartItem) => void;
  updateQuantity: (_id: string, _quantity: number) => void;
  removeItem: (_id: string) => void;
  setItems: (_items: CartItem[]) => void;
  setAppliedCoupon: (_coupon?: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: undefined,
      addItem: _item => {
        const existing = get().items.find(
          i => i.id === _item.id && i.variantId === _item.variantId
        );
        if (existing) {
          set({
            items: get().items.map(i =>
              i === existing ? { ...i, quantity: i.quantity + _item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ..._item, available: true }] });
        }
      },
      updateQuantity: (_id, _quantity) =>
        set({ items: get().items.map(i => (i.id === _id ? { ...i, quantity: _quantity } : i)) }),
      removeItem: _id => set({ items: get().items.filter(i => i.id !== _id) }),
      setItems: _items => set({ items: _items }),
      setAppliedCoupon: _coupon => set({ appliedCoupon: _coupon }),
    }),
    {
      name: 'cartStore',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: persisted => persisted as CartState,
    }
  )
);

export const hydrateCartStore = () => useCartStore.persist.rehydrate();
