import { NextResponse } from "next/server"

// Esta es una simulación de autenticación
// Actualizar la función POST para que también acepte el formato de usuario que viene del registro
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Compatibilidad con ambos formatos (login y registro)
    const usuario = body.usuario
    const contraseña = body.contraseña || body.contrasena

    // Simulación de verificación de credenciales
    if (usuario === "usuario@correo.com" && contraseña === "password") {
      // Generar un token simulado
      const token = "token-simulado-" + Math.random().toString(36).substring(2, 15)

      return NextResponse.json({
        success: true,
        token,
        message: "Inicio de sesión exitoso",
      })
    } else {
      // Credenciales incorrectas
      return NextResponse.json({ success: false, message: "Usuario o contraseña incorrectos" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error en la autenticación:", error)
    return NextResponse.json({ success: false, message: "Error en el servidor" }, { status: 500 })
  }
}

