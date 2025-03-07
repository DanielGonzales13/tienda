"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ClipboardList, ShoppingBag, User } from 'lucide-react'
import { urlBackend } from "@/lib/var"


interface Product {
  id_producto: string
  nombre: string
  precio: number
  imagen: string
}

interface CartItem {
  id_carrito: number
  cantidad: number
  subtotal: number
  producto: Product
}

interface CartData {
  id_carrito: number
  created_at: string
  usuario: {
    id_usuario: number
    usuario: string
    nombre: string
  }
  items_carrito: CartItem[]
}


export default function NavBar() {
  const { items } = useCart()
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [mounted, setMounted] = useState(false)

 const id_usuario:any = localStorage.getItem("id_usuario")
 
 
   const fetchCart = async () => {
 
     try{
       const response = await fetch(`${urlBackend}/carrito/${id_usuario}`)
 
       if(!response.ok)
       {
         throw new Error("Error al obtener datos")
       }
 
       const data = await response.json()
       setCartData(data)
     } catch(err){
       console.error("Error al cargar")
     }
   }

   useEffect(() => {
     fetchCart()
   })

  const cartItemCount = mounted ? items.length : 0
  const totalItems = cartData?.items_carrito?.reduce((total, item) => total + item.cantidad, 0) || 0

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-medium gradient-heading">
          IA-Ecomm
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <Link href="/tienda">
            <Button variant="ghost" size="sm" className="hover:text-primary">
              Productos
            </Button>
          </Link>
          <Link 
              href="/mis-compras" 
              className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted/50 text-left"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Mis compras
            </Link>
          <Link href="/login" className="flex items-center">
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <User className="h-5 w-5" />
              <span className="sr-only">Cuenta</span>
            </Button>
          </Link>
          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative hover:text-primary">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          
        </nav>
      </div>
    </header>
  )
}