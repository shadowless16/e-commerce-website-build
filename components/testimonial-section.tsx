import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Customer",
    content: "Amazing quality and fast shipping. Highly recommend!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Verified Buyer",
    content: "Great products at excellent prices. Will buy again!",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Customer",
    content: "Exceptional customer service and premium quality.",
    rating: 5,
  },
]

export function TestimonialSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Loved by Customers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what our customers have to say about their experience with us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-background rounded-lg p-6 border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground mb-4">{`"${testimonial.content}"`}</p>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
