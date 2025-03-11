import { NextResponse } from "next/server"

// Datos de ejemplo para simular una base de datos
const productos = [
  {
    id: "1",
    nombre: "Camiseta Premium",
    precio: 29.99,
    descripcion:
      "Camiseta de algodón 100% de alta calidad con diseño exclusivo. Perfecta para cualquier ocasión, esta camiseta combina estilo y comodidad. El tejido transpirable te mantiene fresco durante todo el día. Disponible en varios colores y tallas.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "2",
    nombre: "Zapatillas Deportivas",
    precio: 89.99,
    descripcion:
      "Zapatillas deportivas con tecnología de amortiguación avanzada para mayor comodidad. Diseñadas para atletas de todos los niveles, estas zapatillas ofrecen soporte y estabilidad excepcionales. La suela de goma duradera proporciona tracción en diversas superficies.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "3",
    nombre: "Reloj Inteligente",
    precio: 199.99,
    descripcion:
      "Reloj inteligente con monitoreo de salud, notificaciones y resistencia al agua. Este dispositivo de última generación te permite realizar un seguimiento de tu actividad física, recibir notificaciones y mucho más. La batería dura hasta 7 días con una sola carga.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "4",
    nombre: "Auriculares Inalámbricos",
    precio: 149.99,
    descripcion:
      "Auriculares inalámbricos con cancelación de ruido y batería de larga duración. Disfruta de un sonido cristalino sin distracciones. El diseño ergonómico garantiza un ajuste cómodo incluso durante sesiones de escucha prolongadas.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "5",
    nombre: "Mochila Resistente",
    precio: 59.99,
    descripcion:
      "Mochila resistente al agua con múltiples compartimentos y diseño ergonómico. Perfecta para viajes, trabajo o estudio, esta mochila tiene espacio para tu portátil, tableta y otros accesorios. Las correas acolchadas reducen la presión sobre los hombros.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "6",
    nombre: "Botella Térmica",
    precio: 24.99,
    descripcion:
      "Botella térmica que mantiene tus bebidas frías o calientes durante horas. Fabricada con acero inoxidable de grado alimenticio, esta botella es duradera y libre de BPA. Su diseño elegante la hace perfecta para usar en cualquier lugar.",
    imagen: "/placeholder.svg?height=400&width=400",
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simular un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const producto = productos.find((p) => p.id === params.id)

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json(producto)
}

