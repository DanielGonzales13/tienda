import { NextResponse } from "next/server"

// Datos de ejemplo para simular una base de datos
const productos = [
  {
    id: "1",
    nombre: "Camiseta Premium",
    precio: 29.99,
    descripcion: "Camiseta de algodón 100% de alta calidad con diseño exclusivo.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "2",
    nombre: "Zapatillas Deportivas",
    precio: 89.99,
    descripcion: "Zapatillas deportivas con tecnología de amortiguación avanzada para mayor comodidad.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "3",
    nombre: "Reloj Inteligente",
    precio: 199.99,
    descripcion: "Reloj inteligente con monitoreo de salud, notificaciones y resistencia al agua.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "4",
    nombre: "Auriculares Inalámbricos",
    precio: 149.99,
    descripcion: "Auriculares inalámbricos con cancelación de ruido y batería de larga duración.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "5",
    nombre: "Mochila Resistente",
    precio: 59.99,
    descripcion: "Mochila resistente al agua con múltiples compartimentos y diseño ergonómico.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "6",
    nombre: "Botella Térmica",
    precio: 24.99,
    descripcion: "Botella térmica que mantiene tus bebidas frías o calientes durante horas.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
]

export async function GET() {
  // Simular un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(productos)
}

