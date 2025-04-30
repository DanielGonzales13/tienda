export async function POST(req: Request) {
    try {
      const body = await req.json()
      const { products, userId } = body
  
      if (!products || !Array.isArray(products)) {
        return Response.json({ error: "Formato de productos inválido" }, { status: 400 })
      }
  
      // Intentar obtener datos del usuario desde el backend
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
  
        const userDataResponse = await fetch(`${backendUrl}/api/v2`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
  
        if (!userDataResponse.ok) {
          throw new Error(`Error al obtener datos del usuario. Status: ${userDataResponse.status}`)
        }
  
        const userData = await userDataResponse.json()
  
        // Filtrar datos específicos del usuario
        const userCarts =
          userData?.carritos?.filter((cart: any) => {
            return cart.usuario.id_usuario.toString() === userId?.toString()
          }) || []
  
        const userOrders =
          userData?.orden_compras?.filter((order: any) => {
            return order.usuario.id_usuario.toString() === userId?.toString()
          }) || []
  
        const userInfo = userData?.usuarios?.find((user: any) => user.id_usuario.toString() === userId?.toString())
  
        // Si no hay datos de usuario, usar un enfoque más general
        if ((!userCarts || userCarts.length === 0) && (!userOrders || userOrders.length === 0)) {
          // Seleccionar algunos productos aleatorios como recomendación
          const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, products.length))
  
          const randomProductIds = randomProducts.map((p) => p.id_producto)
  
          return Response.json({ productIds: randomProductIds })
        }
  
        const commonPrompts = [
          {
            role: "system",
            content: "Eres un asistente de recomendación de productos inteligente.",
          },
          {
            role: "system",
            content: "Aquí están los datos de productos disponibles: " + JSON.stringify(products),
          },
          {
            role: "system",
            content: "Aquí están los datos del carrito del usuario: " + JSON.stringify(userCarts),
          },
          {
            role: "system",
            content: "Aquí están los datos de órdenes de compra del usuario: " + JSON.stringify(userOrders),
          },
          {
            role: "system",
            content: "Aquí están los datos del usuario: " + JSON.stringify(userInfo || {}),
          },
          {
            role: "system",
            content:
              'IMPORTANTE: Debes responder ÚNICAMENTE con un array JSON de IDs de productos recomendados, sin explicaciones adicionales. Formato: ["id1", "id2", "id3"]',
          },
          {
            role: "user",
            content: `Basado en el historial de compras y carrito del usuario, recomienda productos que podrían interesarle. Si no hay historial suficiente, recomienda productos populares o destacados.`,
          },
        ]
  
        const requestBody = {
          model: "google/gemini-2.0-flash-exp:free",
          messages: commonPrompts,
          stream: false,
        }
  
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer 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",
          },
          body: JSON.stringify(requestBody),
        })
  
        if (!response.ok) {
          throw new Error(`Error en OpenRouter API: ${response.status}`)
        }
  
        const data = await response.json()
  
        let productIds
  
        try {
          // Intentar extraer el array JSON de la respuesta
          const content = data.choices[0].message.content
          productIds = JSON.parse(content)
  
          // Verificar que sea un array
          if (!Array.isArray(productIds)) {
            throw new Error("La respuesta no es un array")
          }
        } catch (error) {
          // En caso de error, usar productos aleatorios
          const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, products.length))
          productIds = randomProducts.map((p) => p.id_producto)
        }
  
        return Response.json({ productIds })
      } catch (backendError) {
        // Si falla la obtención de datos del usuario, recomendar productos aleatorios
        const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, products.length))
        const randomProductIds = randomProducts.map((p) => p.id_producto)
  
        return Response.json({ productIds: randomProductIds })
      }
    } catch (error) {
      return Response.json(
        {
          error: "Error al generar recomendaciones",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  }
  