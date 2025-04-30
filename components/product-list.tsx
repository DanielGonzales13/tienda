"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { ChevronLeft, ChevronRight, Search, ShoppingBag, Tag, Sparkles, User } from 'lucide-react'
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
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [showingRecommendations, setShowingRecommendations] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 8

  const nombre_user = localStorage.getItem("nombre_usuario");

  useEffect(() => {
    // Obtener ID de usuario del localStorage
    const storedUserId = localStorage.getItem("id_usuario")
    setUserId(storedUserId)

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

  // Filtrar productos cuando cambia la categoría seleccionada o el término de búsqueda
  useEffect(() => {
    let result = products

    // Si estamos mostrando recomendaciones, no aplicamos otros filtros
    if (showingRecommendations) {
      return
    }

    // Filtrar por categoría
    if (selectedCategory !== null) {
      result = result.filter((product) => product.categoria.id_categoria === selectedCategory)
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter(
        (product) =>
          product.nombre.toLowerCase().includes(term) || product.categoria.descripcion.toLowerCase().includes(term),
      )
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Resetear a la primera página cuando cambian los filtros
  }, [selectedCategory, products, searchTerm, showingRecommendations])

  // Actualizar productos mostrados basados en la paginación
  useEffect(() => {
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    setDisplayedProducts(filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct))
  }, [filteredProducts, currentPage])

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setShowingRecommendations(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setShowingRecommendations(false)
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

  // Función para obtener recomendaciones de IA
  const getAIRecommendations = async () => {
    const id_usuario = localStorage.getItem("id_usuario")

    if (!id_usuario) {
      setMessage("Debes iniciar sesión para obtener recomendaciones personalizadas")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setIsLoadingRecommendations(true)
    setShowingRecommendations(true)

    try {
      const response = await fetch(`${window.location.origin}/api/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          userId: id_usuario,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al obtener recomendaciones: ${response.status}`)
      }

      const data = await response.json()
      console.log(data);
      if (data.error) {
        throw new Error(data.error)
      }

      // Filtrar productos por IDs recomendados
      const recommendedProducts = products.filter((product) => {
        // Convertir ambos a string para comparación
        return data.productIds.some((id : any) => String(id) === String(product.id_producto))
      })

      if (recommendedProducts.length === 0) {
        setMessage("No se encontraron recomendaciones personalizadas. Mostrando productos destacados.")
        setShowingRecommendations(false)

        // Mostrar algunos productos aleatorios como fallback
        const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, products.length))

        setFilteredProducts(randomProducts)
      } else {
        setFilteredProducts(recommendedProducts)
        setCurrentPage(1)
        setMessage(`Se encontraron ${recommendedProducts.length} productos recomendados para ti`)
      }

      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setMessage(`Error: ${errorMessage}`)
      setTimeout(() => setMessage(""), 5000)
      setShowingRecommendations(false)

      // Restaurar vista normal
      if (selectedCategory !== null) {
        const categoryProducts = products.filter((product) => product.categoria.id_categoria === selectedCategory)
        setFilteredProducts(categoryProducts)
      } else {
        setFilteredProducts(products)
      }
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  // Funciones de paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const resetFilters = () => {
    setShowingRecommendations(false)
    setSelectedCategory(null)
    setSearchTerm("")
    setFilteredProducts(products)
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

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Filtro de categorías horizontal */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Categorías</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <Button
              variant={selectedCategory === null && !showingRecommendations ? "default" : "outline"}
              className="rounded-full"
              onClick={resetFilters}
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
            <Button
              variant={showingRecommendations ? "default" : "outline"}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={getAIRecommendations}
              disabled={isLoadingRecommendations}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Recomendación según IA
            </Button>
          </div>
        </div>
      </div>

      {/* Indicador de recomendaciones */}
      {showingRecommendations && (
        <div className="mb-4 p-2 bg-purple-100 rounded-lg text-purple-800 text-sm flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Mostrando recomendaciones personalizadas basadas en tu historial, {nombre_user}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-purple-800 hover:text-purple-900 hover:bg-purple-200"
            onClick={resetFilters}
          >
            Limpiar
          </Button>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="mb-4 text-sm text-gray-500">
        Mostrando {displayedProducts.length} de {filteredProducts.length} productos
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoadingRecommendations ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2"></div>
            <p>Obteniendo recomendaciones personalizadas...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <p className="col-span-full text-center py-8">No se encontraron productos que coincidan con tu búsqueda</p>
        ) : (
          displayedProducts.map((product) => (
            <Card key={product.id_producto} className="card-hover overflow-hidden border-0 shadow-sm relative">
              {product.promocion && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.promocion.descuento}% OFF
                </div>
              )}
              {showingRecommendations && (
                <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recomendado
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="mx-4 text-sm">
            Página {currentPage} de {totalPages}
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  )
}
