import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  available?: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (_item: CartItem) => void;
  updateQuantity: (_id: string, _quantity: number) => void;
  removeItem: (_id: string) => void;
  setItems: (_items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item => {
        const existing = get().items.find(i => i.id === item.id && i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map(i =>
              i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, available: true }] });
        }
      },
      updateQuantity: (id, quantity) =>
        set({ items: get().items.map(i => (i.id === id ? { ...i, quantity } : i)) }),
      removeItem: id => set({ items: get().items.filter(i => i.id !== id) }),
      setItems: items => set({ items }),
    }),
    {
      name: 'cart',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: persisted => persisted as CartState,
    }
  )
);

export const hydrateCartStore = () => useCartStore.persist.rehydrate();
