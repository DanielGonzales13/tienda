"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { ShoppingBag } from 'lucide-react'
import { urlBackend } from "@/lib/var"

interface Product {
  id_producto: string
  nombre: string
  precio: number
  imagen: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(urlBackend+"/producto")

        if (!response.ok) {
          throw new Error("Error al cargar los productos")
        }

        const data = (await response.json()).data
        setProducts(data)
      } catch (err) {
        setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (product: Product) => {
    try {
      // Agregar al estado local primero para UI inmediata
      addToCart(product)
      var id_usuario:any = localStorage.getItem("id_usuario");
      // Luego enviar al servidor
      const response = await fetch(urlBackend + "/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario: parseInt(id_usuario), id_producto: product.id_producto, cantidad: 1 }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar al carrito")
      }

      setMessage(`${product.nombre} se ha agregado al carrito`)
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("No se pudo agregar el producto al carrito")
      setTimeout(() => setMessage(""), 3000)
      console.error(err)
    }
  }

  if (isLoading) {
    return <p className="text-center py-8">Cargando productos...</p>
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>
  }

  return (
    <>
      {message && (
        <div className="fixed top-20 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50 animate-in slide-in-from-right">{message}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id_producto} className="card-hover overflow-hidden border-0 shadow-sm">
            <Link href={`/producto/${product.id_producto}`}>
              <div className="relative h-64 w-full bg-muted/30 overflow-hidden">
                <img
                  src={product.imagen || "/placeholder.svg?height=256&width=256"}
                  alt={product.nombre}
                  
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/producto/${product.id_producto}`} className="hover:underline">
                <h3 className="font-medium text-lg">{product.nombre}</h3>
              </Link>
              <p className="font-bold mt-2 text-primary">Q.{product.precio.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                onClick={() => handleAddToCart(product)} 
                className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Agregar al Carrito
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}