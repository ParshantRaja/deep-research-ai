import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 md:p-24 font-sans transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        
        <h1 className="text-4xl font-bold text-foreground mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last Updated: May 1, 2026</p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your email address when you sign in via Google. We also store your research queries and generated reports locally or in our secure database.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Data</h2>
            <p>Your data is used solely to provide and improve the research service. We do not sell your personal information or research history to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. AI Training</h2>
            <p>We do not use your private research data or personal information to train global AI models. Your insights remain your own.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Security</h2>
            <p>We implement industry-standard security measures to protect your account and data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Third-Party Services</h2>
            <p>We use trusted third-party APIs (like Google Gemini and Tavily) to power our research engine. These services have their own privacy policies regarding data processing.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
