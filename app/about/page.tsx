import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-accent/10 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">About LUXE</h1>
            <p className="text-lg text-muted-foreground">Discover our story and values</p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Who We Are</h2>
              <p className="text-lg text-muted-foreground mb-4">
                LUXE is a premium e-commerce platform dedicated to bringing exceptional products to discerning
                customers. We believe in quality over quantity and carefully curate every item in our collection.
              </p>
              <p className="text-lg text-muted-foreground">
                Founded in 2020, we've grown to become a trusted destination for those who appreciate fine craftsmanship
                and attention to detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide premium, curated products that enrich the lives of our customers while maintaining the
                  highest standards of quality and service.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  To become the preferred destination for luxury products by combining innovation, quality, and
                  exceptional customer experience.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Our Values</h3>
                <p className="text-muted-foreground">
                  Quality, integrity, customer satisfaction, and sustainability guide every decision we make.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Curated selection of premium products</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Free shipping on all orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>30-day money back guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Exceptional customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold text-xl">✓</span>
                  <span>Secure and easy checkout</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-8">
              <Link href="/shop">
                <Button size="lg">Explore Our Collection</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
