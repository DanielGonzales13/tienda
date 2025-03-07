// app/admin/ordenes/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, ArrowLeft, Calendar, CreditCard, MapPin, User } from 'lucide-react'
import Link from "next/link"
import { formatDate } from "@/lib/utils"
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true)
      setError(null)

      try {
        // En un entorno real, deberías tener un endpoint para obtener una orden específica
        // Como no tenemos ese endpoint, obtendremos todas las órdenes y filtraremos
        const response = await fetch(urlBackend+"/orden-compra")

        if (!response.ok) {
          throw new Error("Error al cargar la orden")
        }

        const data = await response.json()
        const foundOrder = data.find((o: Order) => o.id_orden_compra.toString() === id)
        
        if (!foundOrder) {
          throw new Error("Orden no encontrada")
        }
        
        setOrder(foundOrder)
      } catch (err) {
        console.error("Error al cargar la orden:", err)
        setError("No se pudo cargar la información de la orden")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Cargando detalles de la orden...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{error || "Orden no encontrada"}</p>
        <Link href="/admin/ordenes">
          <Button>Volver a Órdenes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/ordenes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight gradient-heading">
          Orden #{order.id_orden_compra}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 card-hover">
          <CardHeader>
            <CardTitle>Detalles de la Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Fecha de Compra</div>
                  <div className="flex items-center font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {formatDate(order.fecha_compra)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Método de Pago</div>
                  <div className="flex items-center font-medium">
                    <CreditCard className="h-4 w-4 mr-2 text-primary" />
                    {order.metodo_de_pago}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Dirección de Envío</div>
                  <div className="flex items-center font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {order.direccion_envio}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Cliente</div>
                  <div className="flex items-center font-medium">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {order.usuario.nombre}
                  </div>
                  <div className="text-sm text-muted-foreground">{order.usuario.usuario}</div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Productos</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Imagen</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio Unitario</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items_orden_compra.map((item) => (
                        <TableRow key={item.id_item_orden_compra}>
                          <TableCell>
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                              <img
                                src={item.producto.imagen || "/placeholder.svg?height=40&width=40"}
                                alt={item.producto.nombre}
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                          <TableCell>Q. {item.producto.precio.toFixed(2)}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell className="text-right font-semibold">
                            Q. {item.subtotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">Q. {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">Gratis</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">Q. {order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}