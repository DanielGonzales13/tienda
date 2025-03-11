// app/mis-compras/page.tsx
"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Package, Calendar, CreditCard, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import Image from "next/image"
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

export default function MisComprasPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  useEffect(() => {
    async function fetchOrders() {

      try {
        const id_usuario:any = localStorage.getItem("id_usuario")
        const response = await fetch(`${urlBackend}/orden-compra/${id_usuario}`)

        if (!response.ok) {
          throw new Error("Error al cargar el historial de compras")
        }

        const data = await response.json()
        setOrders(data)

      } catch (err) {
        console.error("Error al cargar órdenes:", err)
        setError("No se pudo cargar tu historial de compras. Intenta nuevamente más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  })

  const toggleOrderDetails = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container px-4 py-8 mx-auto">
          <h1 className="text-3xl font-bold mb-6 gradient-heading">Mi Historial de Compras</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Cargando tu historial de compras...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-4">No tienes compras realizadas</h2>
              <p className="text-muted-foreground mb-8">
                Cuando realices compras, podrás ver tu historial completo en esta sección.
              </p>
              <Link href="/tienda">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id_orden_compra} className="card-hover overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center">
                          Orden #{order.id_orden_compra}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({order.items_orden_compra.length} {order.items_orden_compra.length === 1 ? 'producto' : 'productos'})
                          </span>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(order.fecha_compra)}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="h-3.5 w-3.5 mr-1" />
                            {order.metodo_de_pago}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {order.direccion_envio}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total</div>
                          <div className="font-bold text-lg text-primary">Q. {order.total.toFixed(2)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderDetails(order.id_orden_compra)}
                          className="flex items-center gap-1"
                        >
                          {expandedOrder === order.id_orden_compra ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span className="hidden sm:inline">Ocultar detalles</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span className="hidden sm:inline">Ver detalles</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedOrder === order.id_orden_compra && (
                    <CardContent className="pt-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Producto</TableHead>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Precio</TableHead>
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
                                <TableCell>Q.{item.producto.precio.toFixed(2)}</TableCell>
                                <TableCell>{item.cantidad}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  Q. {item.subtotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}