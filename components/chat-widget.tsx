"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import $ from "jquery"
import { urlBackend } from "@/lib/var"

export default function ChatWidget() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Cargar jQuery si no está disponible
    if (!window.jQuery) {
      const script = document.createElement("script")
      script.src = "https://code.jquery.com/jquery-3.6.0.min.js"
      script.onload = initializeChat
      document.head.appendChild(script)
    } else {
      initializeChat()
    }

    return () => {
      // Limpiar cuando el componente se desmonte
      const chatButton = document.getElementById("chat-button")
      const chatContainer = document.getElementById("chat-container")
      if (chatButton) chatButton.remove()
      if (chatContainer) chatContainer.remove()
    }
  }, [])

  function initializeChat() {
    if (document.getElementById("chat-button")) return

    // Crear el botón de chat
    const chatButton = document.createElement("button")
    chatButton.id = "chat-button"
    chatButton.innerHTML = "💬"
    document.body.appendChild(chatButton)

    // Crear el contenedor del chat
    const chatContainer = document.createElement("div")
    chatContainer.id = "chat-container"
    const isAdmin = window.location.pathname.includes("/admin/")
    chatContainer.innerHTML = `
  <div id="chat-header">Asistente ${isAdmin ? "de Administración ✨" : "Virtual ✈️"}</div>
  <div id="chat-messages"></div>
  <div id="chat-input">
    <input type="text" id="user-input" placeholder="${isAdmin ? "Consulta sobre estadísticas, ventas o usuarios..." : "Escribe tu pregunta..."}">
    <button id="send-button">➤</button>
  </div>
`
    document.body.appendChild(chatContainer)

    // Ocultar el contenedor inicialmente
    $(chatContainer).hide()

    // Configurar eventos
    $(chatButton).on("click", () => {
      $(chatContainer).toggle()

      if (!window.Data) {
        $.get(`${urlBackend}/api`)
          .done((data: any) => {
            window.Data = data
            window.dataDisponible = true
          })
          .fail(() => {
            window.dataDisponible = false
            $("#chat-messages").append(`<div class='bot-message'>Data no se encuentra disponible, favor validar</div>`)
          })
      }
    })

    $(document).on("click", "#send-button", sendMessage)
    $(document).on("keypress", "#user-input", (e: any) => {
      if (e.which === 13) {
        sendMessage()
      }
    })

    function sendMessage() {
      $.get(`${urlBackend}/api`)
        .done((data: any) => {
          window.Data = data
          window.dataDisponible = true
        })
        .fail(() => {
          window.dataDisponible = false
          $("#chat-messages").append(`<div class='bot-message'>Data no se encuentra disponible, favor validar</div>`)
        })

      const pathname = window.location.pathname
      const url = window.location.href.replace(pathname, "")
      const isAdmin = pathname.includes("/admin") // Check if user is in admin section

      const userText = $("#user-input").val()?.toString().trim() || ""
      if (userText === "") return
      const id_user = localStorage.getItem("id_usuario")

      const loadingMessage = `<div class='bot-message typing-animation' id='loading-message'></div>`
      $("#chat-messages").append(`<div class='user-message'>${userText}</div>`)
      $("#chat-messages").append(loadingMessage)
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight)
      $("#user-input").val("")

      // Create base prompts that are common for both admin and regular users
      const commonPrompts = [
        {
          role: "system",
          content: "Eres un asistente útil que responde preguntas basándose en la información proporcionada.",
        },
        {
          role: "system",
          content:
            "Aquí están los datos que debes utilizar de productos: " + JSON.stringify(window?.Data?.productos || ""),
        },
        {
          role: "system",
          content:
            "Aquí están los datos que debes utilizar de categorias de los productos: " +
            JSON.stringify(window?.Data?.categorias || ""),
        },
        {
          role: "system",
          content: "Las fechas estan en formato ISO 8601, yyyy-mm-ddTHH:MM:SS.SSZ, la fecha actual es: " + new Date(),
        },
        {
          role: "user",
          content: "Los valores de precios están en quetzales (Q.)",
        },
        {
          role: "user",
          content: "Cuando respondas no utilices datos como ID.",
        },
        {
          role: "system",
          content:
            "IMPORTANTE: Cuando necesites incluir enlaces, usa HTML directo como <a href='URL'>texto</a> en lugar de formato Markdown [texto](url).",
        },
      ]

      // Create specific prompts based on whether user is in admin section or not
      let contextSpecificPrompts = []

      if (isAdmin) {
        // Admin-specific prompts
        contextSpecificPrompts = [
          {
            role: "system",
            content: "CONTEXTO: Estás asistiendo a un ADMINISTRADOR del sistema.",
          },
          {
            role: "system",
            content:
              "Aquí están TODOS los datos de carritos (datos seleccionados que no se han comprado): " +
              JSON.stringify(window?.Data?.carritos || ""),
          },
          {
            role: "system",
            content:
              "Aquí están TODOS los datos de ordenes de compra (productos ya comprados): " +
              JSON.stringify(window?.Data?.orden_compras || ""),
          },
          {
            role: "system",
            content: "Aquí están TODOS los datos de usuarios: " + JSON.stringify(window?.Data?.usuarios || ""),
          },
          {
            role: "system",
            content:
              "Cuando sean sumas o calculos, trata de enfocarte bien en las cantidades, precios, subtotales, totales. Realiza los calculos de acuerdo a la información proporcionada",
          },
          {
            role: "system",
            content:
              "Proporciona análisis detallados, estadísticas y tendencias basadas en todos los datos disponibles.",
          },
          {
            role: "system",
            content: "Incluye información sobre todos los usuarios, productos y órdenes cuando sea relevante.",
          },
          {
            role: "system",
            content: "Ofrece insights sobre ventas, inventario, y comportamiento de usuarios cuando sea apropiado.",
          },
          {
            role: "user",
            content: "Para ir a producto usa HTML: <a href='" + url + "/admin/productos/ID_PRODUCTO'>Ver producto</a>",
          },
          {
            role: "user",
            content:
              "Para ir al detalle de la orden usa HTML: <a href='" + url + "/admin/ordenes/ID_ORDEN'>Ver orden</a>",
          },
          {
            role: "user",
            content:
              "Para ir al detalle del usuario usa HTML: <a href='" +
              url +
              "/admin/usuarios/ID_USUARIO'>Ver usuario</a>",
          },
          {
            role: "user",
            content: "Soy Usuario Administrador esta es mi solicitud: " + userText,
          },
        ]
      } else {
        // Regular user-specific prompts
        // Filter data to only include information relevant to this user
        const userCarts = window?.Data?.carritos?.filter((cart: any) => {
          return cart.usuario.id_usuario.toString() === id_user?.toString()
        }) || []
        const userOrders =
          window?.Data?.orden_compras?.filter((order: any) => {
            // Convert both IDs to strings for comparison to avoid type mismatches
            return order.usuario.id_usuario.toString() === id_user?.toString()
          }) || []
        const userData = window?.Data?.usuarios?.find((user: any) => user.id_usuario.toString() === id_user?.toString())

        contextSpecificPrompts = [
          {
            role: "system",
            content: "CONTEXTO: Estás asistiendo a un CLIENTE de la tienda.",
          },
          {
            role: "system",
            content: "Aquí están los datos del carrito del usuario actual: " + JSON.stringify(userCarts),
          },
          {
            role: "system",
            content: "Aquí están los datos de órdenes de compra del usuario actual: " + JSON.stringify(userOrders),
          },
          {
            role: "system",
            content: "Aquí están los datos del usuario actual: " + JSON.stringify(userData || ""),
          },
          {
            role: "system",
            content: "Limita tus respuestas a información relevante para este usuario específico.",
          },
          {
            role: "system",
            content: "Enfócate en productos, categorías, promociones y la información personal del usuario.",
          },
          {
            role: "system",
            content: "No menciones datos de otros usuarios ni estadísticas generales de la tienda.",
          },
          {
            role: "user",
            content: "Para ir a producto usa HTML: <a href='" + url + "/producto/ID_PRODUCTO'>Ver producto</a>",
          },
          {
            role: "user",
            content: "Para ir a carrito usa HTML: <a href='" + url + "/carrito'>Ver carrito</a>",
          },
          {
            role: "user",
            content: "Para ir a mis órdenes usa HTML: <a href='" + url + "/mis-ordenes'>Ver mis órdenes</a>",
          },
          {
            role: "user",
            content: "Soy Usuario con id; " + id_user + ", esta es mi solicitud: " + userText,
          },
        ]
      }

      // Combine common and context-specific prompts
      const allPrompts = [
        ...commonPrompts,
        ...contextSpecificPrompts
      ]

      const requestBody = {
        model: "google/gemini-2.0-flash-exp:free",
        messages: allPrompts,
      }

      console.log("Mensajes enviados al modelo:", requestBody.messages)

      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((data) => {
          $("#loading-message").remove()
          let message = data.choices[0].message.content.replace(/\n/g, " <br /> ")

          // Fix for Markdown-style links [text](url)
          message = message.replace(
            /\[([^\]]+)\]$$([^)]+)$$/g,
            '<a href="$2" target="_blank" style="text-decoration:underline; color:blue">$1</a>',
          )

          // Fix for plain URLs
          message = message.replace(
            /(?<![='"(])(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" style="text-decoration:underline; color:blue">$1</a>',
          )

          $("#chat-messages").append(`<div class='bot-message'>${message}</div>`)
          $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight)
        })
        .catch((error) => {
          $("#loading-message").remove()
          $("#chat-messages").append(`<div class='bot-message'>Error al obtener respuesta.</div>`)
        })
    }
  }

  return (
    <>
      {isClient && (
        <style jsx global>{`
          /* Botón flotante */
          #chat-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            border: none;
            padding: 15px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
          }

          #chat-container {
            position: fixed;
            bottom: 80px;
            right: 20px;
            min-width: 40vw;
            max-width: 60vw;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            max-height: 60vh;
            min-height: 50vh;
            border-radius: 10px;
            z-index: 99999;
          }

          #chat-header {
            background-color: #007bff;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            border-radius: 10px 10px 0 0;
          }

          #chat-messages {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            max-height: calc(60vh - 50px);
          }

          #chat-input {
            display: flex;
            border-top: 1px solid #ccc;
            padding: 5px;
            position: sticky;
            bottom: 0;
            background: white;
          }

          #chat-input input {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 5px;
            outline: none;
          }

          #chat-input button {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px;
            margin-left: 5px;
            border-radius: 5px;
            cursor: pointer;
          }

          .user-message {
            background: #007bff;
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            margin: 5px 0;
            text-align: right;
          }

          .bot-message {
            background: #ffffff;
            padding: 5px 10px;
            border-radius: 10px;
            margin: 5px 0;
            text-align: left;
          }

          @keyframes dots {
            0% { content: "."; }
            33% { content: ".."; }
            66% { content: "..."; }
            100% { content: "...."; }
          }

          .typing-animation::after {
            content: "Escribiendo";
            animation: dots 1.5s infinite steps(1);
          }

          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      )}
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
    </>
  )
}
