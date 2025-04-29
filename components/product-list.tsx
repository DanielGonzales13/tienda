"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { ShoppingBag, Tag } from "lucide-react"
import { urlBackend } from "@/lib/var"

interface Promotion {
  id_promocion: number
  fecha_inicio: string
  fecha_fin: string
  descuento: number
}

interface Category {
  id_categoria: number
  descripcion: string
  created_at: string
}

interface Product {
  id_producto: string
  nombre: string
  precio: number
  precio_real: number
  imagen: string
  promocion: Promotion | null
  categoria: Category
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(urlBackend + "/producto")

        if (!response.ok) {
          throw new Error("Error al cargar los productos")
        }

        const data = (await response.json()).data
        setProducts(data)
        setFilteredProducts(data)

        // Extraer categorías únicas
        const uniqueCategories = Array.from(
          new Map(data.map((item: any) => [item.categoria.id_categoria, item.categoria])).values(),
        ) as Category[]
        setCategories(uniqueCategories)
      } catch (err) {
        setError("No se pudieron cargar los productos. Intente nuevamente más tarde.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filtrar productos cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter((product) => product.categoria.id_categoria === selectedCategory)
      setFilteredProducts(filtered)
    }
  }, [selectedCategory, products])

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
  }

  const handleAddToCart = async (product: Product) => {
    try {
      // Agregar al estado local primero para UI inmediata
      addToCart(product)
      const id_usuario: any = localStorage.getItem("id_usuario")
      // Luego enviar al servidor
      const response = await fetch(urlBackend + "/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: Number.parseInt(id_usuario),
          id_producto: product.id_producto,
          cantidad: 1,
        }),
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
        <div className="fixed top-20 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50 animate-in slide-in-from-right">
          {message}
        </div>
      )}

      {/* Filtro de categorías horizontal */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Categorías</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="rounded-full"
              onClick={() => handleCategorySelect(null)}
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id_categoria}
                variant={selectedCategory === category.id_categoria ? "default" : "outline"}
                className="rounded-full"
                onClick={() => handleCategorySelect(category.id_categoria)}
              >
                {category.descripcion}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center py-8">No hay productos en esta categoría</p>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id_producto} className="card-hover overflow-hidden border-0 shadow-sm relative">
              {product.promocion && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.promocion.descuento}% OFF
                </div>
              )}
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
                <div className="mt-2">
                  {product.promocion ? (
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-primary">Q.{product.precio.toFixed(2)}</p>
                      <p className="text-gray-500 line-through text-sm">Q.{product.precio_real.toFixed(2)}</p>
                    </div>
                  ) : (
                    <p className="font-bold text-primary">Q.{product.precio.toFixed(2)}</p>
                  )}
                </div>
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
          ))
        )}
      </div>
    </>
  )
}
