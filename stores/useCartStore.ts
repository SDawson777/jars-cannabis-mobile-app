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

interface _AddItemFn {
  (_item: CartItem): void;
}

interface _UpdateQuantityFn {
  (_id: string, _quantity: number): void;
}

interface _RemoveItemFn {
  (_id: string): void;
}

interface _SetItemsFn {
  (_items: CartItem[]): void;
}

interface _SetAppliedCouponFn {
  (_coupon?: string): void;
}

interface _ClearCartFn {
  (): void;
}

export const useCartStore = create<CartState>()(
  persist<CartState>(
    (
      set: (partial: Partial<CartState>, replace?: boolean | undefined) => void,
      get: () => CartState
    ): CartState => ({
      items: [],
      appliedCoupon: undefined,
      addItem: (_item: CartItem) => {
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
      updateQuantity: (_id: string, _quantity: number) =>
        set({ items: get().items.map(i => (i.id === _id ? { ...i, quantity: _quantity } : i)) }),
      removeItem: (_id: string) => set({ items: get().items.filter(i => i.id !== _id) }),
      setItems: (_items: CartItem[]) =>
        set({ items: _items.map(i => ({ ...i, productId: i.productId ?? i.id })) }),
      setAppliedCoupon: (_coupon?: string) => set({ appliedCoupon: _coupon }),
      clearCart: () => set({ items: [], appliedCoupon: undefined }),
    }),
    {
      name: 'cartStore',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: unknown) => persisted as CartState,
    }
  )
);

export const hydrateCartStore = () => useCartStore.persist.rehydrate();
