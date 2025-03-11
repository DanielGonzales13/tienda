import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Tag, ShoppingBag, ShoppingCart } from "lucide-react"
import ChatWidget from "@/components/chat-widget"

export const metadata: Metadata = {
  title: "Admin - Panel de Administración",
  description: "Panel de administración para gestionar productos y categorías",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/productos">
            <Button variant="ghost" className="w-full justify-start">
              <Package className="mr-2 h-4 w-4" />
              Productos
            </Button>
          </Link>
          <Link href="/admin/categorias">
            <Button variant="ghost" className="w-full justify-start">
              <Tag className="mr-2 h-4 w-4" />
              Categorías
            </Button>
          </Link>
          <Link href="/tienda">
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Tienda
            </Button>
          </Link>
          <Link href="/admin/ordenes">
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Ordenes
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden sticky top-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin Panel</span>
            </Link>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/productos">
                <Button variant="ghost" size="icon">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/categorias">
                <Button variant="ghost" size="icon">
                  <Tag className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tienda">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
            <ChatWidget />
    </div>
  )
}

