import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag, ShoppingBag, ArrowRight, ShoppingBasket } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { GradientHeader } from "@/components/ui/gradient-header"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <GradientHeader 
        title="Panel de Administración" 
        description="Gestiona los productos y categorías de tu tienda" 
        className="bg-gradient-to-r from-primary/20 via-accent/10 to-background"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="gradient-border card-hover">
          <div className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-2xl font-bold">Gestión de Productos</div>
              <p className="text-xs text-muted-foreground mt-1">Añade, edita y elimina productos</p>
              <Link href="/admin/productos" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="gap-1 border-primary text-primary hover:bg-primary/10">
                  Ir a Productos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>

        <Card className="gradient-border card-hover">
          <div className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <Tag className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-2xl font-bold">Gestión de Categorías</div>
              <p className="text-xs text-muted-foreground mt-1">Administra las categorías de productos</p>
              <Link href="/admin/categorias" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="gap-1 border-accent text-accent hover:bg-accent/10">
                  Ir a Categorías
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>

        <Card className="gradient-border card-hover">
          <div className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Tienda</CardTitle>
              <ShoppingBag className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-2xl font-bold">Ver Tienda</div>
              <p className="text-xs text-muted-foreground mt-1">Visualiza tu tienda como la ven los clientes</p>
              <Link href="/tienda" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="gap-1 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">
                  Ir a la Tienda
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>

        <Card className="gradient-border card-hover">
          <div className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Ordenes de compra</CardTitle>
              <ShoppingBasket className="h-4 w-4 text-blur-500" />
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-2xl font-bold">Ver Ordenes</div>
              <p className="text-xs text-muted-foreground mt-1">Visualiza las ordenes de compra</p>
              <Link href="/admin/ordenes" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="gap-1 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">
                  Ir a ordenes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}