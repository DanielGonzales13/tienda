"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, ImageIcon, Loader2, RefreshCw } from "lucide-react"
import { urlBackend } from "@/lib/var"

interface Product {
  id_producto: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria?: {
    descripcion: string
  }
}

export default function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState("")
  const { addToCart } = useCart()
  const router = useRouter()

  // Estados para la descripción generada por IA
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

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
          cantidad: quantity,
        }),
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

  // Función para analizar la imagen del producto
  const analyzeProductImage = async () => {
    if (!product || !product.imagen) return

  setIsAnalyzingImage(true)
  setAnalysisError(null)
  setDebugInfo(null)

  try {
    const promptText = `Genera una descripción detallada y atractiva para un producto llamado "${product.nombre}" que pertenece a la categoría "${product.categoria?.descripcion || "producto"}".
    
    Información adicional del producto: "${product.descripcion || "No disponible"}"
    
    La descripción debe:
    - Tener entre 3-5 oraciones
    - Destacar posibles características, beneficios y usos
    - Ser persuasiva y profesional
    - No mencionar que es una descripción generada
    - Enfocarse en la calidad, diseño y valor del producto
    - Complementar la descripción original, no repetirla
    - Usar la imagen para identificar características visuales, en las cuales debes enfocarte con prioridad, dejando la descripción del producto en segundo plano
    
    Responde SOLO con la descripción, sin introducción ni comentarios adicionales.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer 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", 
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages: [
          {
            role: "system",
            content:
              "Eres un especialista en marketing y descripción de productos. Tu tarea es crear descripciones detalladas, atractivas y persuasivas para productos de e-commerce basadas en imágenes y datos del producto.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: promptText,
              },
              {
                type: "image_url",
                image_url: {
                  url: product.imagen,
                },
              },
            ],
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      setDebugInfo(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`)
      throw new Error("Error al comunicarse con OpenRouter")
    }

    const data = await response.json()

    const description = data?.choices?.[0]?.message?.content
    if (!description) {
      throw new Error("Respuesta inválida de OpenRouter")
    }

    setAiDescription(description)
    setDebugInfo("Descripción generada correctamente")
  } catch (err) {
    console.error("Error al analizar la imagen:", err)
    setAnalysisError(err instanceof Error ? err.message : "Error al analizar la imagen")
  } finally {
    setIsAnalyzingImage(false)
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
        <div className="fixed top-20 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50 animate-in slide-in-from-right">
          {message}
        </div>
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
            <h3 className="text-lg font-medium">Descripción</h3>
            <p>{product.descripcion}</p>
          </div>

          {/* Botones para analizar la imagen */}
          {!aiDescription && !isAnalyzingImage && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={analyzeProductImage} className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Generar descripción con IA
              </Button>
            </div>
          )}

          {/* Estado de carga del análisis */}
          {isAnalyzingImage && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analizando imagen y datos del producto...</span>
            </div>
          )}

          {/* Información de depuración */}
          {debugInfo && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono overflow-auto max-h-32">
              <p className="font-semibold mb-1">Información:</p>
              {debugInfo}
            </div>
          )}

          {/* Error en el análisis */}
          {analysisError && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">Error:</p>
              {analysisError}
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={analyzeProductImage} className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Descripción generada por IA */}
          {aiDescription && (
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-md border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-medium flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300">
                <ImageIcon className="h-4 w-4" />
                Descripción generada por IA - <b>Visión por Computadora</b>
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{aiDescription}</p>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAiDescription(null)
                    setDebugInfo(null)
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800"
                >
                  Generar otra descripción
                </Button>
              </div>
            </div>
          )}

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
