import ChatWidget from "@/components/chat-widget"
import NavBar from "@/components/nav-bar"
import ProductDetail from "@/components/product-detail"
import Footer from "@/components/footer"
 
interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <div className="container px-4 py-8 mx-auto">
        <ProductDetail id={params.id} />
      </div>
      <ChatWidget />
      <Footer />
    </div>
  )
}

