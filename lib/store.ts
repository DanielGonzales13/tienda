import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Product {
  id: string
  nombre: string
  precio: number
  imagen?: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (product) =>
        set((state) => ({
          items: [...state.items, product],
        })),
      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item, index) => {
            // Find first occurrence of the product and remove it
            const firstIndex = state.items.findIndex((i) => i.id === productId)
            return index !== firstIndex
          }),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
)

