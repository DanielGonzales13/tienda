"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Search, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { urlBackend } from "@/lib/var"

interface Producto {
  id: string | number
  nombre: string
  cantidad: number
  precio: number
  id_categoria: number
  descripcion: string
  imagen: string
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchProductos()
  }, [])

  async function fetchProductos() {
    setIsLoading(true)
    setError(null)

    try {
      // Usamos la API simulada para desarrollo
      const response = await fetch(urlBackend + "/producto")

      if (!response.ok) {
        throw new Error("Error al cargar los productos")
      }

      const data = await response.json()

      console.log(data);
      // Adaptamos el formato de los datos para que coincida con nuestra interfaz
    const productosFormateados = data.data.map((p: any) => ({
        id: p.id_producto,
        nombre: p.nombre,
        cantidad: p.cantidad, // Valor por defecto si no existe
        precio: p.precio,
        id_categoria: p.categoria.descripcion, // Valor por defecto si no existe
        descripcion: p.descripcion || "",
        imagen:  p.imagen || "/placeholder.svg?height=100&width=100",
    }))

      setProductos(productosFormateados)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los productos")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteProducto(id: string | number) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return
    }

    setDeleteLoading(String(id))

    try {
      const response = await fetch(urlBackend + `/producto/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      // Actualizar la lista de productos
      setProductos(productos.filter((p) => p.id !== id))

      // Mostrar mensaje de éxito (en un caso real usaríamos un toast)
      alert("Producto eliminado con éxito")
    } catch (err) {
      console.error(err)
      alert("Error al eliminar el producto")
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los productos de tu tienda</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Productos</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchProductos}>
                Reintentar
              </Button>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                          <img
                            src={producto.imagen || "/placeholder.svg?height=40&width=40"}
                            alt={producto.nombre}
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>Q.{producto.precio.toFixed(2)}</TableCell>
                      <TableCell>{producto.cantidad}</TableCell>
                      <TableCell>{producto.id_categoria}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/productos/editar/${producto.id}`}>
                            <Button variant="outline" size="icon">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteProducto(producto.id)}
                            disabled={deleteLoading === String(producto.id)}
                          >
                            {deleteLoading === String(producto.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

