"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { urlBackend } from "@/lib/var"

interface Categoria {
  id_categoria: number
  descripcion: string
}

interface Producto {
  id: string | number
  nombre: string
  cantidad: number
  precio: number
  id_categoria: number
  descripcion: string
  imagen: string
}

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducto, setIsLoadingProducto] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "0",
    precio: "0",
    id_categoria: "",
    descripcion: "",
    imagen: "",
  })

  useEffect(() => {
    async function fetchProducto() {
      setIsLoadingProducto(true)
      setError(null)

      try {
        // Para desarrollo usamos la API simulada
        const response = await fetch(`${urlBackend}/producto/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Producto no encontrado")
          }
          throw new Error("Error al cargar el producto")
        }

        const producto = (await response.json()).data

        setFormData({
          nombre: producto.nombre,
          cantidad: String(producto.cantidad || 100),
          precio: String(producto.precio),
          id_categoria: String(producto.categoria.descripcion || 1),
          descripcion: producto.descripcion || "",
          imagen: producto.imagen || "",
        })
      } catch (err) {
        console.error("Error al cargar el producto:", err)
        setError("No se pudo cargar el producto")
      } finally {
        setIsLoadingProducto(false)
      }
    }

    async function fetchCategorias() {
      try {
        const response = await fetch(urlBackend + "/categoria")

        if (!response.ok) {
          throw new Error("Error al cargar las categorías")
        }

        const data = await response.json()

        if (data.data && Array.isArray(data.data)) {
          setCategorias(data.data)
        } else {
          setCategorias([])
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err)
        // Categorías de ejemplo para desarrollo
        
      } finally {
        setLoadingCategorias(false)
      }
    }

    fetchProducto()
    fetchCategorias()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, id_categoria: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convertir valores numéricos
      const productoData = {
        ...formData,
        cantidad: Number.parseInt(formData.cantidad),
        precio: Number.parseFloat(formData.precio),
        id_categoria: Number.parseInt(formData.id_categoria),
      }

      const response = await fetch(`${urlBackend}/producto/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el producto")
      }

      const data = await response.json()
      alert(data.mensaje || "Producto actualizado con éxito")
      router.push("/admin/productos")
    } catch (err) {
      console.error("Error al actualizar el producto:", err)
      alert("Error al actualizar el producto. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/admin/productos">
          <Button>Volver a Productos</Button>
        </Link>
      </div>
    )
  }

  if (isLoadingProducto) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/productos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Actualiza los detalles del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del producto"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagen">URL de la Imagen</Label>
                <Input
                  id="imagen"
                  name="imagen"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imagen}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad en Stock</Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                {loadingCategorias ? (
                  <Select
                    value=""
                    onValueChange={() => {}}
                    defaultValue="Cargando categorías..."
                    disabled={true}
                  />
                ) : (
                  <Select
                    value={formData.id_categoria}
                    onValueChange={handleSelectChange}
                    defaultValue="Selecciona una categoría"
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione Categoria"/>
                      </SelectTrigger>  
                    <SelectContent>
                    {
                      categorias.map(cat=>
                          <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                            {cat.descripcion}
                          </SelectItem>                    
                    )}
                  </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                placeholder="Descripción detallada del producto"
                rows={5}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/admin/productos">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Producto"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

