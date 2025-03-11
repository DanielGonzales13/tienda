"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { urlBackend } from "@/lib/var"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [contrasena, setContraseña] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch(urlBackend + "/usuario/sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, contrasena }),
      })

      const data = await response.json()
      console.log(data);

      if (response.ok) {
        // Guardar token o información de sesión
        localStorage.setItem("id_usuario", data.usuario.id_usuario)
        setMessage("Inicio de sesión exitoso. Redirigiendo...")
        setTimeout(() => router.push("/tienda"), 1000)
      } else {
        setMessage(data.message || "Usuario o contraseña incorrectos")
      }
    } catch (error) {
      setMessage("Error de conexión. No se pudo conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>
            {message && (
              <div
                className={`p-3 rounded-md ${message.includes("exitoso") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/registro" className="text-primary hover:underline">
                Registrarse
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

