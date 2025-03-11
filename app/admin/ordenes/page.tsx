// app/admin/ordenes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle, Search, Eye, Calendar, CreditCard, MapPin, User } from 'lucide-react'
import { GradientHeader } from "@/components/ui/gradient-header"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { urlBackend } from "@/lib/var"

interface Product {
  id_producto: number
  nombre: string
  precio: number
  imagen: string
  descripcion: string
}

interface OrderItem {
  id_item_orden_compra: number
  cantidad: number
  subtotal: number
  producto: Product
}

interface Order {
  id_orden_compra: number
  total: number
  metodo_de_pago: string
  direccion_envio: string
  fecha_compra: string
  usuario: {
    id_usuario: number
    usuario: string
    nombre: string
  }
  items_orden_compra: OrderItem[]
}

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(urlBackend + "/orden-compra")

      if (!response.ok) {
        throw new Error("Error al cargar las órdenes")
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error("Error al cargar órdenes:", err)
      setError("No se pudieron cargar las órdenes. Intenta nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      order.id_orden_compra.toString().includes(searchLower) ||
      order.usuario.nombre.toLowerCase().includes(searchLower) ||
      order.usuario.usuario.toLowerCase().includes(searchLower) ||
      order.direccion_envio.toLowerCase().includes(searchLower) ||
      order.metodo_de_pago.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <GradientHeader 
        title="Órdenes de Compra" 
        description="Gestiona y visualiza todas las órdenes realizadas en la tienda" 
        className="bg-gradient-to-r from-primary/20 via-accent/10 to-background"
      />

      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Lista de Órdenes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar órdenes..."
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
              <Button variant="outline" className="mt-4" onClick={fetchOrders}>
                Reintentar
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron órdenes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id_orden_compra}>
                      <TableCell className="font-medium">#{order.id_orden_compra}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.usuario.nombre}</span>
                          <span className="text-xs text-muted-foreground">{order.usuario.usuario}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.fecha_compra)}</TableCell>
                      <TableCell className="font-semibold">Q. {order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {order.metodo_de_pago}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {order.direccion_envio}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/ordenes/${order.id_orden_compra}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            Detalles
                          </Button>
                        </Link>
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