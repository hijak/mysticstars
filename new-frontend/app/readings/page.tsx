import { Header } from "@/components/header"
import { GridBeam } from "@/components/beam-effect"
import { apiClient } from "@/lib/api-client"
import { zodiacSigns } from "@/lib/zodiac-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"
import LinkWrapper from "next/link"

export const dynamic = 'force-dynamic'

export default async function ReadingsPage() {
  // Fetch all readings for all signs
  const readingsData = await Promise.allSettled(
    zodiacSigns.map(async (sign) => {
      try {
        const data = await apiClient.getCompleteHoroscope(sign.sign.toLowerCase())
        return {
          sign: sign.sign,
          symbol: sign.symbol,
          element: sign.element,
          data: data.data,
          validFrom: data.validFrom,
          validUntil: data.validUntil,
          success: true
        }
      } catch {
        return {
          sign: sign.sign,
          symbol: sign.symbol,
          element: sign.element,
          data: null,
          validFrom: null,
          validUntil: null,
          success: false
        }
      }
    })
  )

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative min-h-screen">

      <GridBeam />
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground mb-6">
            <Link className="w-4 h-4 text-primary" />
            <span>{today}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            All Daily Readings
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore today's horoscope readings for all zodiac signs. Click on any card to view the complete reading.
          </p>
        </section>

        {/* Readings Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingsData.map((result, index) => {
            const reading = result.status === 'fulfilled' ? result.value : null

            if (!reading || !reading.success || !reading.data) {
              // Loading/Error state
              return (
                <Card
                  key={index}
                  className="bg-card/30 border-border/50 opacity-50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{reading?.symbol || '✧'}</span>
                        <div>
                          <CardTitle className="text-lg">{reading?.sign || 'Unknown'}</CardTitle>
                          <p className="text-xs text-muted-foreground">Loading...</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">
                      Reading not available at this time.
                    </p>
                  </CardContent>
                </Card>
              )
            }

            const { data, validFrom, validUntil, sign, symbol, element } = reading

            return (
              <LinkWrapper
                key={sign}
                href={`/sign/${sign.toLowerCase()}`}
                className="group"
              >
                <Card className="h-full bg-card/30 border-border/50 hover:border-primary/30 transition-all duration-300 hover:bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl group-hover:scale-110 transition-transform">{symbol}</span>
                        <div>
                          <CardTitle className="text-lg capitalize">{sign}</CardTitle>
                          <Badge variant="secondary" className="text-xs bg-secondary/50">
                            {element}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Daily Reading Preview */}
                    {data.daily ? (
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {data.daily}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Daily reading not available.
                      </p>
                    )}

                    {/* Lucky Influences */}
                    {data.lucky && (data.lucky.number || data.lucky.color || data.lucky.time) && (
                      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                        {data.lucky.number && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{data.lucky.number}</p>
                            <p className="text-xs text-muted-foreground">Number</p>
                          </div>
                        )}
                        {data.lucky.color && (
                          <div className="text-center">
                            <p className="text-xs font-medium text-accent">{data.lucky.color}</p>
                            <p className="text-xs text-muted-foreground">Color</p>
                          </div>
                        )}
                        {data.lucky.time && (
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{data.lucky.time}</p>
                            <p className="text-xs text-muted-foreground">Power Hour</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validity */}
                    {validFrom && validUntil && (
                      <p className="text-xs text-muted-foreground">
                        Valid until {new Date(validUntil).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </LinkWrapper>
            )
          })}
        </section>

        {/* Footer Note */}
        <section className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Click on any sign to view the complete reading including Love, Career, and Health insights.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 Mystic Stars. The cosmos await your discovery.</p>
        </div>
      </footer>
    </div>
  )
}
