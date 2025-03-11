"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import NavBar from "@/components/nav-bar"
import { Trash2, Loader2, CheckCircle } from "lucide-react"
import { urlBackend } from "@/lib/var"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import ChatWidget from "@/components/chat-widget"

interface Product {
  id_producto: string
  nombre: string
  precio: number
  imagen: string
}

interface CartItem {
  id_carrito: number
  cantidad: number
  subtotal: number
  producto: Product
}

interface CartData {
  id_carrito: number
  created_at: string
  usuario: {
    id_usuario: number
    usuario: string
    nombre: string
  }
  items_carrito: CartItem[]
}

interface OrderResponse {
  mensaje: string
  ordenCompra: {
    usuario: {
      id_usuario: number
      usuario: string
      nombre: string
    }
    total: number
    metodo_de_pago: string
    direccion_envio: string
    id_orden_compra: number
    fecha_compra: string
  }
}

export default function CarritoPage() {
  const { removeFromCart } = useCart()
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Estados para el modal de pago
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [metodoPago, setMetodoPago] = useState("")
  const [direccionEnvio, setDireccionEnvio] = useState("")
  const [processingOrder, setProcessingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null)

  // ID del usuario - en una aplicación real, esto vendría de localStorage
  const id_usuario = typeof window !== "undefined" ? localStorage.getItem("id_usuario") || "1" : "1"

  const fetchCart = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${urlBackend}/carrito/${id_usuario}`)

      if (!response.ok) {
        throw new Error("Error al obtener el carrito")
      }

      const data = await response.json()
      setCartData(data)
    } catch (err) {
      console.error("Error al cargar el carrito:", err)
      setError("No se pudo cargar el carrito. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveItem = async (productId: string, cantidad = 1) => {
    try {
      // Enviar al servidor
      const response = await fetch(`${urlBackend}/carrito/remove-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: Number.parseInt(id_usuario),
          id_producto: Number.parseInt(productId)
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("Error en la respuesta:", data)
        throw new Error("Error al actualizar el carrito")
      }

      // Actualizar el carrito después de la modificación
      fetchCart()

      setMessage("El producto se ha actualizado en el carrito")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("No se pudo actualizar el producto en el carrito")
      setTimeout(() => setMessage(""), 3000)
      console.error(err)
    }
  }

  const handleCheckout = () => {
    // Abrir el modal de pago
    setCheckoutModalOpen(true)
  }

  const handlePlaceOrder = async () => {
    if (!metodoPago) {
      setMessage("Por favor selecciona un método de pago")
      return
    }

    if (!direccionEnvio.trim()) {
      setMessage("Por favor ingresa una dirección de envío")
      return
    }

    setProcessingOrder(true)

    try {
      const orderData = {
        id_usuario: Number(id_usuario),
        metodo_de_pago: metodoPago,
        direccion_envio: direccionEnvio,
      }

      const response = await fetch(`${urlBackend}/orden-compra`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Error al procesar la orden")
      }

      const data = await response.json()
      setOrderResponse(data)
      setOrderSuccess(true)

      // Limpiar el formulario
      setMetodoPago("")
      setDireccionEnvio("")
    } catch (err) {
      console.error("Error al procesar la orden:", err)
      setMessage("Error al procesar la orden. Por favor intenta de nuevo.")
    } finally {
      setProcessingOrder(false)
    }
  }

  const handleCloseSuccessDialog = () => {
    setCheckoutModalOpen(false)
    setOrderSuccess(false)
    // Recargar el carrito después de una compra exitosa
    fetchCart()
  }

  const totalItems = cartData?.items_carrito?.reduce((total, item) => total + item.cantidad, 0) || 0
  const subtotal = cartData?.items_carrito?.reduce((total, item) => total + item.subtotal, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6 gradient-heading">Tu Carrito</h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md animate-in fade-in-50">{message}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando tu carrito...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCart}>Reintentar</Button>
          </div>
        ) : !cartData || !cartData.items_carrito || cartData.items_carrito.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8">Parece que aún no has agregado productos a tu carrito</p>
            <Link href="/tienda">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Explorar Productos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg shadow-sm overflow-hidden card-hover">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Productos ({totalItems})</h2>
                  <div className="divide-y">
                    {cartData.items_carrito.map((item) => (
                      <div key={item.producto.id_producto} className="py-6 flex items-center">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted/30">
                          <img
                            src={item.producto.imagen || "/placeholder.svg?height=80&width=80"}
                            alt={item.producto.nombre}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.producto.nombre}</h3>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.cantidad}</p>
                          <p className="font-semibold text-primary">Q.{item.subtotal.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.producto.id_producto, item.cantidad)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-card rounded-lg shadow-sm overflow-hidden sticky top-24 card-hover">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Resumen</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Q. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Envío</span>
                      <span>Gratis</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">Q.{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={!cartData || cartData.items_carrito.length === 0}
                    >
                      Proceder al Pago
                    </Button>
                    <Link href="/tienda">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        Continuar Comprando
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <ChatWidget />
          </div>
        )}

        {/* Modal de Pago */}
        <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {orderSuccess ? (
              <div className="py-6 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <DialogTitle className="text-2xl">¡Compra Exitosa!</DialogTitle>
                <DialogDescription className="text-base">
                  Tu orden #{orderResponse?.ordenCompra.id_orden_compra} ha sido procesada correctamente.
                </DialogDescription>
                <div className="bg-muted p-4 rounded-md text-left mt-4">
                  <p className="font-medium">Detalles de la orden:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>
                      <span className="text-muted-foreground">Fecha:</span>{" "}
                      {orderResponse?.ordenCompra.fecha_compra
                        ? new Date(orderResponse.ordenCompra.fecha_compra).toLocaleString()
                        : ""}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Total:</span> Q.
                      {orderResponse?.ordenCompra.total.toFixed(2)}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Método de pago:</span>{" "}
                      {orderResponse?.ordenCompra.metodo_de_pago}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Dirección:</span>{" "}
                      {orderResponse?.ordenCompra.direccion_envio}
                    </li>
                  </ul>
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={handleCloseSuccessDialog} className="w-full">
                    Continuar
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Finalizar Compra</DialogTitle>
                  <DialogDescription>Completa la información para procesar tu pedido</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payment-method">Método de Pago</Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Selecciona un método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="efectivo">Pago en Efectivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shipping-address">Dirección de Envío</Label>
                    <Textarea
                      id="shipping-address"
                      placeholder="Ingresa tu dirección completa"
                      value={direccionEnvio}
                      onChange={(e) => setDireccionEnvio(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-md mt-2">
                    <p className="font-medium">Resumen del pedido:</p>
                    <div className="flex justify-between mt-2">
                      <span>Total ({totalItems} productos):</span>
                      <span className="font-bold">Q. {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCheckoutModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={processingOrder}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {processingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Pedido"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

