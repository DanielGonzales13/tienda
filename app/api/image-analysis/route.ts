export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageUrl, productName, productCategory, productDescription } = body

    if (!imageUrl) {
      console.log("Error: URL de imagen no proporcionada")
      return Response.json({ error: "URL de imagen no proporcionada" }, { status: 400 })
    }

    if (!productName) {
      console.log("Error: Nombre de producto no proporcionado")
      return Response.json({ error: "Nombre de producto no proporcionado" }, { status: 400 })
    }

    console.log("Procesando imagen:", imageUrl)
    console.log("Datos del producto:", { productName, productCategory, productDescription })

    // Verificar si la URL es accesible
    try {
      const imageCheck = await fetch(imageUrl, { method: "HEAD" })
      if (!imageCheck.ok) {
        console.log(`Error al acceder a la imagen. Status: ${imageCheck.status}`)
        return Response.json({ error: `La imagen no es accesible. Status: ${imageCheck.status}` }, { status: 400 })
      }
    } catch (imageError) {
      console.log("Error al verificar la imagen:", imageError)
      return Response.json({ error: "No se puede acceder a la URL de la imagen" }, { status: 400 })
    }

    // Enviar solicitud a la API con todos los datos
    try {
      console.log("Enviando solicitud a OpenRouter con imagen y datos del producto")

      // Crear un prompt que incluya toda la información disponible
      const promptText = `Genera una descripción detallada y atractiva para un producto llamado "${productName}" que pertenece a la categoría "${productCategory || "producto"}".
      
      Información adicional del producto: "${productDescription || "No disponible"}"
      
      La descripción debe:
      - Tener entre 3-5 oraciones
      - Destacar posibles características, beneficios y usos
      - Ser persuasiva y profesional
      - No mencionar que es una descripción generada
      - Enfocarse en la calidad, diseño y valor del producto
      - Complementar la descripción original, no repetirla
      - Usar la imagen para identificar características visuales
      
      Responde SOLO con la descripción, sin introducción ni comentarios adicionales.`

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout:free",
          messages: [
            {
              role: "system",
              content: `Eres un especialista en marketing y descripción de productos. Tu tarea es crear descripciones detalladas, atractivas y persuasivas para productos de e-commerce basadas en imágenes y datos del producto.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          stream: false,
        }),
      })

      console.log("Respuesta de OpenRouter recibida. Status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log("Error en OpenRouter API:", response.status, errorData)
        return Response.json(
          {
            error: `Error en OpenRouter API: ${response.status}`,
            details: errorData,
          },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("Datos recibidos de OpenRouter:", JSON.stringify(data).substring(0, 200) + "...")

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.log("Formato de respuesta inesperado:", data)
        return Response.json({ error: "Formato de respuesta inesperado de la API" }, { status: 500 })
      }

      const generatedDescription = data.choices[0].message.content
      return Response.json({
        description: generatedDescription,
        note: "Descripción generada basada en la imagen y datos del producto",
      })
    } catch (apiError) {
      console.log("Error al comunicarse con OpenRouter:", apiError)
      return Response.json(
        {
          error: "Error al comunicarse con el servicio de IA",
          details: apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.log("Error general en el endpoint:", error)
    return Response.json(
      {
        error: "Error al analizar la imagen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
