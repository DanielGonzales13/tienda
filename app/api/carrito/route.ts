import { NextResponse } from "next/server"

// En un entorno real, esto se guardaría en una base de datos
let carrito: { productId: string; cantidad: number }[] = []

export async function GET() {
  // Simular un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(carrito)
}

export async function POST(request: Request) {
  try {
    const { productId, cantidad } = await request.json()

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = carrito.findIndex((item) => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Actualizar la cantidad si el producto ya está en el carrito
      carrito[existingItemIndex].cantidad += cantidad
    } else {
      // Agregar nuevo producto al carrito
      carrito.push({ productId, cantidad })
    }

    return NextResponse.json({
      success: true,
      message: "Producto agregado al carrito",
      carrito,
    })
  } catch (error) {
    console.error("Error al agregar al carrito:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { productId } = await request.json()

    // Filtrar el producto del carrito
    carrito = carrito.filter((item) => item.productId !== productId)

    return NextResponse.json({
      success: true,
      message: "Producto eliminado del carrito",
      carrito,
    })
  } catch (error) {
    console.error("Error al eliminar del carrito:", error)
    return NextResponse.json({ success: false, message: "Error al procesar la solicitud" }, { status: 500 })
  }
}

