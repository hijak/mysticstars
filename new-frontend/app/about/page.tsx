import { Header } from "@/components/header"
import { GridBeam } from "@/components/beam-effect"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Hash, Palette, Clock, Sparkles, Star, Moon, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <GridBeam />
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>About Mystic Stars</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Cosmic Guide
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mystic Stars combines ancient astrological wisdom with modern AI to deliver personalized 
            horoscope readings that inspire and guide your daily journey.
          </p>
        </section>

        {/* Lucky Influences Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Understanding Your Lucky Influences
          </h2>
          
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Each day, we calculate unique lucky influences based on your zodiac sign and the current 
            celestial alignments. These mystical elements can help guide your decisions and bring 
            positive energy into your day.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Lucky Number */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <Hash className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Lucky Number</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your daily lucky number (1-99) is calculated based on your zodiac sign's unique 
                  vibrational frequency for the day. Use it when making choices, playing games, 
                  or as a guiding symbol. Many find synchronicities when they notice their lucky 
                  number appearing throughout the day.
                </p>
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> Look for your number in addresses, times, prices, or 
                    phone numbers as signs from the universe.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lucky Color */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mx-auto mb-4">
                  <Palette className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Lucky Color</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Colors carry powerful energetic vibrations. Your daily lucky color is chosen from 
                  a palette of 42 mystical hues, each resonating with different aspects of life. 
                  Wearing or surrounding yourself with your lucky color can enhance your energy 
                  and attract positive outcomes.
                </p>
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> Incorporate your color into your outfit, workspace decor, 
                    or even the food you eat for maximum cosmic alignment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Power Hour */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Power Hour</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your Power Hour is the optimal time window when cosmic energies align most 
                  favorably for your sign. During this hour (between 6 AM and 10 PM), your 
                  intentions are amplified, making it ideal for important decisions, starting 
                  new projects, or having meaningful conversations.
                </p>
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> Schedule important meetings, set intentions, or practice 
                    manifestation during your Power Hour.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Reading Types Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Our Reading Types
          </h2>

          <div className="space-y-6">
            <Card className="bg-card/30 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Daily Readings</h3>
                    <p className="text-sm text-muted-foreground">
                      Fresh insights generated each day, focusing on immediate opportunities and 
                      challenges. Includes your daily lucky influences (number, color, and power hour) 
                      plus focused readings for love, career, and health.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Moon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Weekly Readings</h3>
                    <p className="text-sm text-muted-foreground">
                      A broader perspective on the week ahead, helping you plan and prepare for 
                      upcoming themes and energies. Perfect for setting weekly intentions and goals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Monthly Readings</h3>
                    <p className="text-sm text-muted-foreground">
                      Deep insights into the month's major themes, personal growth opportunities, 
                      and relationship dynamics. Ideal for monthly reflection and planning.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Yearly Readings</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive guidance for the entire year, covering major life themes, 
                      transformative opportunities, and long-term growth areas. Your cosmic roadmap 
                      for the year ahead.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            How Mystic Stars Works
          </h2>

          <Card className="bg-gradient-to-br from-card/50 to-secondary/30 border-border/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3 text-primary">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our readings are generated using advanced AI technology, trained to deliver 
                    meaningful, personalized guidance that balances mystical wisdom with practical 
                    advice. Each reading is unique and freshly generated.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Cosmic Calculations</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Lucky influences are calculated using a deterministic algorithm that combines 
                    your zodiac sign with the current date, ensuring consistent yet unique results 
                    that change daily while remaining reproducible.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Daily Refresh</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All readings are automatically regenerated to ensure you always receive fresh, 
                    relevant guidance. Daily readings refresh each morning, while longer-term 
                    readings update on their respective cycles.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">For Entertainment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mystic Stars is designed for entertainment and inspirational purposes. While 
                    our readings can provide thought-provoking insights, they should not replace 
                    professional advice for important life decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer CTA */}
        <section className="text-center">
          <p className="text-muted-foreground mb-4">
            Ready to discover what the stars have in store for you?
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Explore Your Sign
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Mystic Stars. The cosmos await your discovery.
          </p>
        </div>
      </footer>
    </div>
  )
}
