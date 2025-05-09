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
import { ArrowLeft, Loader2, AlertCircle, Tag, Trash2 } from "lucide-react"
import Link from "next/link"
import { urlBackend } from "@/lib/var"

interface Categoria {
  id_categoria: number
  descripcion: string
}

interface Promocion {
  id_promocion: number
  fecha_inicio: string
  fecha_fin: string
  descuento: number
}

interface Producto {
  id: string | number
  nombre: string
  cantidad: number
  precio: number
  precio_real: number
  id_categoria: number
  descripcion: string
  imagen: string
  promocion: Promocion | null
}

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducto, setIsLoadingProducto] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [promocion, setPromocion] = useState<Promocion | null>(null)
  const [isPromocionLoading, setIsPromocionLoading] = useState(false)
  const [showPromocionForm, setShowPromocionForm] = useState(false)
  const [promocionFormData, setPromocionFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    descuento: "0",
  })

  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "0",
    precio: "0",
    precio_real: "0",
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
          precio: String(producto.precio || 0),
          precio_real: String(producto.precio_real || 0),
          id_categoria: String(producto.categoria.id_categoria || 1),
          descripcion: producto.descripcion || "",
          imagen: producto.imagen || "",
        })

        // Guardar la promoción si existe
        setPromocion(producto.promocion)

        // Inicializar el formulario de promoción con fechas por defecto
        const today = new Date()
        const twoWeeksLater = new Date(today)
        twoWeeksLater.setDate(today.getDate() + 14)

        setPromocionFormData({
          fecha_inicio: today.toISOString().split("T")[0],
          fecha_fin: twoWeeksLater.toISOString().split("T")[0],
          descuento: "10",
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
      } finally {
        setLoadingCategorias(false)
      }
    }

    fetchProducto()
    fetchCategorias()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`Cambiando ${name} a: ${value}`)
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePromocionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPromocionFormData((prev) => ({ ...prev, [name]: value }))
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
        precio: Number.parseFloat(formData.precio_real),
        id_categoria: Number.parseInt(formData.id_categoria),
      }

      console.log("Enviando datos:", productoData)

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

  const handleAddPromocion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPromocionLoading(true)

    try {
      const promocionData = {
        fecha_inicio: promocionFormData.fecha_inicio,
        fecha_fin: promocionFormData.fecha_fin,
        descuento: Number.parseInt(promocionFormData.descuento),
        id_producto: Number.parseInt(id),
      }

      const response = await fetch(`${urlBackend}/promocion/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promocionData),
      })

      if (!response.ok) {
        throw new Error("Error al agregar la promoción")
      }

      const data = await response.json()
      alert(data.mensaje || "Promoción agregada con éxito")

      // Actualizar el estado de la promoción
      setPromocion({
        id_promocion: data.data.id_promocion || 0,
        ...promocionData,
      })
      setShowPromocionForm(false)
    } catch (err) {
      console.error("Error al agregar la promoción:", err)
      alert("Error al agregar la promoción. Inténtalo de nuevo.")
    } finally {
      setIsPromocionLoading(false)
    }
  }

  const handleDeletePromocion = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta promoción?")) {
      return
    }

    setIsPromocionLoading(true)

    try {
      const response = await fetch(`${urlBackend}/promocion/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la promoción")
      }

      alert("Promoción eliminada con éxito")
      setPromocion(null)
    } catch (err) {
      console.error("Error al eliminar la promoción:", err)
      alert("Error al eliminar la promoción. Inténtalo de nuevo.")
    } finally {
      setIsPromocionLoading(false)
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
                <Label htmlFor="precio_real">Precio</Label>
                <Input
                  id="precio_real"
                  name="precio_real"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precio_real}
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
                  <Select value="" onValueChange={() => {}} defaultValue="Cargando categorías..." disabled={true} />
                ) : (
                  <Select
                    value={formData.id_categoria}
                    onValueChange={handleSelectChange}
                    defaultValue="Selecciona una categoría"
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                          {cat.descripcion}
                        </SelectItem>
                      ))}
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

      {/* Sección de Promociones */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Promociones</CardTitle>
          <CardDescription>Administra las promociones para este producto</CardDescription>
        </CardHeader>
        <CardContent>
          {promocion ? (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-primary" />
                    Promoción Activa: {promocion.descuento}% de descuento
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Válida desde {new Date(promocion.fecha_inicio).toLocaleDateString()}
                    hasta {new Date(promocion.fecha_fin).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Precio original:</span> Q.{formData.precio_real}
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600">Precio con descuento:</span> Q.
                    {(
                      Number.parseFloat(formData.precio_real) -
                      (Number.parseFloat(formData.precio_real) * promocion.descuento) / 100
                    ).toFixed(2)}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeletePromocion} disabled={isPromocionLoading}>
                  {isPromocionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : showPromocionForm ? (
            <form onSubmit={handleAddPromocion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                  <Input
                    id="fecha_inicio"
                    name="fecha_inicio"
                    type="date"
                    value={promocionFormData.fecha_inicio}
                    onChange={handlePromocionChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                  <Input
                    id="fecha_fin"
                    name="fecha_fin"
                    type="date"
                    value={promocionFormData.fecha_fin}
                    onChange={handlePromocionChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descuento">Porcentaje de Descuento</Label>
                  <Input
                    id="descuento"
                    name="descuento"
                    type="number"
                    min="1"
                    max="99"
                    value={promocionFormData.descuento}
                    onChange={handlePromocionChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPromocionForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPromocionLoading}>
                  {isPromocionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Promoción"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Este producto no tiene promociones activas</p>
              <Button onClick={() => setShowPromocionForm(true)}>
                <Tag className="h-4 w-4 mr-2" />
                Agregar Promoción
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
