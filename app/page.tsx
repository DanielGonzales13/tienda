import Link from "next/link"
import { Button } from "@/components/ui/button"
import  Footer  from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-5xl px-4 py-16 md:py-24">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-heading">
                Descubre nuestra colección
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                Productos de alta calidad con diseños exclusivos para ti.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="min-w-[150px] bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    
  )
}