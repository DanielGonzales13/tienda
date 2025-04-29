import ProductList from "@/components/product-list"
import NavBar from "@/components/nav-bar"
import ChatWidget from "@/components/chat-widget"
import Footer from "@/components/footer"

export default function TiendaPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-8">Productos</h1>
        <ProductList />
      </div>
      <ChatWidget />
      <Footer />
    </div>
  )
}

