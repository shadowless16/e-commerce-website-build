import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Jumot Collections ("we," "us," "our," or "Company") operates the website. This page informs you of our policies
                regarding the collection, use, and disclosure of personal data when you use our Service and the choices
                you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information Collection and Use</h2>
              <p className="text-muted-foreground mb-4">
                We collect several different types of information for various purposes to provide and improve our
                Service to you.
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Personal Data: Name, email address, postal address, phone number, cookies and usage data</li>
                <li>Usage Data: Information about how you access and use the Service</li>
                <li>Device Information: Browser type, IP address, pages visited, time and date stamps</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Security of Data</h2>
              <p className="text-muted-foreground">
                The security of your data is important to us but remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable
                means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
              </p>
              <p className="text-muted-foreground">Email: privacy@Jumot Collections.com</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
