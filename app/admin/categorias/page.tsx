"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Categoria {
  id_categoria: number
  descripcion: string
  created_at?: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    setIsLoading(true)
    setError(null)

    try {
      // Cambiando de "categorias" a "categoria" (singular)
      const response = await fetch("https://ecommerce-backend-94h4.onrender.com/categoria")

      if (!response.ok) {
        throw new Error(`Error al cargar las categorías: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        setCategorias(data.data)
      } else {
        setCategorias([])
      }
    } catch (err:any) {
      setError("No se pudieron cargar las categorías. Verifica tu conexión a internet.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateCategoria() {
    if (!nuevaCategoria.trim()) {
      alert("Por favor ingresa una descripción para la categoría")
      return
    }

    setIsCreating(true)

    try {
      // Cambiando de "categorias" a "categoria" (singular)
      const response = await fetch("https://ecommerce-backend-94h4.onrender.com/categoria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descripcion: nuevaCategoria }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert("Error: " + data.mensaje);
        
      }

      const data = await response.json()

      fetchCategorias()
      setNuevaCategoria("")
      setDialogOpen(false)
      alert(data.mensaje || "Categoría creada con éxito")
    } catch (err:any) {
      console.log(JSON.stringify(err));
      console.error("Error detallado:", err)
      //alert("Error al crear la categoría. Verifica tu conexión a internet.")
    } finally {
      setIsCreating(false)
    }
  }

  const filteredCategorias = categorias.filter((categoria) =>
    categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-2">Gestiona las categorías de productos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent onClose={() => setDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
              <DialogDescription>Crea una nueva categoría para tus productos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Nombre de la categoría"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCategoria} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Categoría"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Categorías</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar categorías..."
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
              <Button variant="outline" className="mt-4" onClick={fetchCategorias}>
                Reintentar
              </Button>
            </div>
          ) : filteredCategorias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron categorías</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategorias.map((categoria) => (
                    <TableRow key={categoria.id_categoria}>
                      <TableCell>{categoria.id_categoria}</TableCell>
                      <TableCell className="font-medium">{categoria.descripcion}</TableCell>
                      <TableCell>
                        {categoria.created_at ? new Date(categoria.created_at).toLocaleDateString() : "N/A"}
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

