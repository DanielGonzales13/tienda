"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface Product {
  id_producto: string
  nombre: string
  precio: number
  imagen?: string
}

interface CartContextType {
  items: Product[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
    setLoaded(true)
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, loaded])

  const addToCart = (product: Product) => {
    setItems((prev) => [...prev, product])
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id_producto === productId)
      if (index === -1) return prev

      const newItems = [...prev]
      newItems.splice(index, 1)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
  }

  return <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}

