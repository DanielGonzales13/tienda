import { Download } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-600">© 2025 Tienda. Todos los derechos reservados.</p>
        <div className="flex flex-col items-center md:items-end">
          <a
            href="/aplicaciones/miapp.apk"
            download
            className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Download size={18} />
            Descargar Aplicación
          </a>
          <p className="text-xs text-gray-500 mt-1">Solo para dispositivos Android. Versión 1.0.0</p>
        </div>
      </div>
    </footer>
  )
}
