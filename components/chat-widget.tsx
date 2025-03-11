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
    chatContainer.innerHTML = `
      <div id="chat-header">Asistente Virtual ✈️</div>
      <div id="chat-messages"></div>
      <div id="chat-input">
        <input type="text" id="user-input" placeholder="Escribe tu pregunta...">
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
          .done((data:any) => {
            window.Data = JSON.stringify(data)
            window.dataDisponible = true
          })
          .fail(() => {
            window.dataDisponible = false
            $("#chat-messages").append(`<div class='bot-message'>Data no se encuentra disponible, favor validar</div>`)
          })
      }
    })

    $(document).on("click", "#send-button", sendMessage)
    $(document).on("keypress", "#user-input", (e:any) => {
      if (e.which === 13) {
        sendMessage()
      }
    })

    function sendMessage() {

      $.get(`${urlBackend}/api`)
          .done((data:any) => {
            window.Data = JSON.stringify(data)
            window.dataDisponible = true
          })
          .fail(() => {
            window.dataDisponible = false
            $("#chat-messages").append(`<div class='bot-message'>Data no se encuentra disponible, favor validar</div>`)
      })
      const pathname = window.location.pathname;
      const url = window.location.href.replace(pathname, '')

      const userText = $("#user-input").val()?.toString().trim() || ""
      if (userText === "") return
      const id_user = localStorage.getItem("id_usuario");

      const loadingMessage = `<div class='bot-message typing-animation' id='loading-message'></div>`
      $("#chat-messages").append(`<div class='user-message'>${userText}</div>`)
      $("#chat-messages").append(loadingMessage)
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight)
      $("#user-input").val("")

      fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer KAy4JcIjdlh1zE6i0xzDpwOwn0k4gTZP",
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "Eres un asistente útil que responde preguntas basándose en la información proporcionada.",
            },
            {
              role: "user",
              content: "Aquí están los datos que debes utilizar: " + window.Data ,
            },
            {
              role: "user",
              content: "Los valores de precios estan en quetzales (Q.)",
            },
            {
              role: "user",
              content: "Cuando respondas no utilices datos como ID.",
            },
            {
              role: "user",
              content: "Para ir a producto colocar, la dirección: "+ url +"/producto/:id_producto  cambia :id_producto por el id del producto" ,
            },
            {
              role: "user",
              content: "Para ir al detalle de la orden colocar, la dirección: "+ url + "/admin/ordenes/:id_orden  cambia :id_orden por el id de la orden" ,
            },
            {
              role: "user",
              content: "Para ir a carrito colocar, la dirección: "+ url +"/carrito" ,
            },
            {
              role: "user",
              content: "Soy Usuario con id; " + id_user + ", esta es mi solicitud: " + userText,
            },
          ],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          $("#loading-message").remove()
          let message = data.choices[0].message.content.replace(/\n/g, "<br />")
          message = message.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          message = message.replace(/\(?\b(https?:\/\/[^\s)]+)\)?/g, '<a href="$1" target="_blank" style="text-decoration:underline; color:blue">Aquí</a>');
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
            background: #000000;
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

