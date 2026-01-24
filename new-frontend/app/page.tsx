import { Header } from "@/components/header"
import { LightRays } from "@/components/magicui/light-rays"
import { ZodiacCard } from "@/components/zodiac-card"
import { zodiacSigns } from "@/lib/zodiac-data"
import { Sparkles, Moon, Star } from "lucide-react"

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative min-h-screen">

      <LightRays />
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="relative text-center mb-20">
          {/* Animated stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Star className="absolute top-10 left-20 w-3 h-3 text-primary/40 animate-pulse" />
            <Star className="absolute top-20 right-32 w-2 h-2 text-accent/40 animate-pulse delay-300" />
            <Moon className="absolute top-5 right-20 w-4 h-4 text-primary/30 animate-pulse delay-700" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{today}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-b from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Discover Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Cosmic Destiny
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore personalized horoscope readings guided by the celestial movements. Select your zodiac sign below to
            unveil what the stars have in store for you.
          </p>

          {/* Decorative beam line */}
          <div className="mt-12 relative">
            <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          </div>
        </section>

        {/* Zodiac Grid */}
        <section id="daily" className="mb-20">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Choose Your Sign</h2>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {zodiacSigns.map((zodiac) => (
              <ZodiacCard key={zodiac.sign} {...zodiac} />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: Star,
              title: "Daily Readings",
              description: "Fresh horoscope insights updated every day at midnight",
            },
            {
              icon: Moon,
              title: "Lunar Guidance",
              description: "Moon phase influences on your emotional and spiritual energy",
            },
            {
              icon: Sparkles,
              title: "Cosmic Compatibility",
              description: "Discover how your sign interacts with others in love and life",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-lg bg-card/30 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <feature.icon className="w-8 h-8 text-primary mb-4 transition-transform group-hover:scale-110" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 Mystic Stars. The cosmos await your discovery.</p>
        </div>
      </footer>
    </div>
  )
}
