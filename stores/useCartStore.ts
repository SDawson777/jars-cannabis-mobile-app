import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
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
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: undefined,
      addItem: _item => {
        const existing = get().items.find(
          i =>
            (i.id === _item.id || i.productId === _item.productId) &&
            i.variantId === _item.variantId
        );
        if (existing) {
          set({
            items: get().items.map(i =>
              i === existing ? { ...i, quantity: i.quantity + _item.quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ..._item, productId: _item.productId ?? _item.id, available: true },
            ],
          });
        }
      },
      updateQuantity: (_id, _quantity) =>
        set({ items: get().items.map(i => (i.id === _id ? { ...i, quantity: _quantity } : i)) }),
      removeItem: _id => set({ items: get().items.filter(i => i.id !== _id) }),
      setItems: _items =>
        set({ items: _items.map(i => ({ ...i, productId: i.productId ?? i.id })) }),
      setAppliedCoupon: _coupon => set({ appliedCoupon: _coupon }),
      clearCart: () => set({ items: [], appliedCoupon: undefined }),
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
