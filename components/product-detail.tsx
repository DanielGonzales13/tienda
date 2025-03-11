"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { urlBackend } from "@/lib/var"

interface Product {
  id_producto: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
}

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState("")
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`${urlBackend}/producto/${id}`)

        if (response.status === 404) {
          router.push("/tienda")
          return
        }

        if (!response.ok) {
          throw new Error("Error al cargar el producto")
        }

        const data = (await response.json()).data
        setProduct(data)
      } catch (err) {
        setError("No se pudo cargar el producto. Intente nuevamente más tarde.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    if (!product) return

    try {
      // Agregar al estado local primero para UI inmediata
      for (let i = 0; i < quantity; i++) {
        addToCart(product)
      }
      const id_usuario:any = localStorage.getItem("id_usuario");
      // Luego enviar al servidor
      const response = await fetch(urlBackend + "/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario: parseInt(id_usuario), id_producto: product.id_producto, cantidad: quantity }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar al carrito")
      }

      setMessage(`${quantity} ${quantity > 1 ? "unidades" : "unidad"} de ${product.nombre} se ha agregado al carrito`)
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("No se pudo agregar el producto al carrito")
      setTimeout(() => setMessage(""), 3000)
      console.error(err)
    }
  }

  if (isLoading) {
    return <p className="text-center py-8">Cargando producto...</p>
  }

  if (error || !product) {
    return <p className="text-red-500 text-center py-8">{error || "Producto no encontrado"}</p>
  }

  return (
    <>
      {message && (
        <div className="fixed top-20 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50">{message}</div>
      )}
      <div className="grid md:grid-cols-2 gap-12 py-8">
        <div className="relative aspect-square rounded-md overflow-hidden bg-muted/30">
          <img
            src={product.imagen || "/placeholder.svg?height=600&width=600"}
            alt={product.nombre}
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.nombre}</h1>
            <p className="text-2xl font-medium mt-2">Q. {product.precio.toFixed(2)}</p>
          </div>

          <div className="prose prose-gray dark:prose-invert">
            <p>{product.descripcion}</p>
          </div>

          <div className="pt-4">
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex items-center border rounded-md">
                <button
                  className="p-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-1 min-w-[40px] text-center">{quantity}</span>
                <button
                  className="p-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button onClick={handleAddToCart} className="w-full" size="lg">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

