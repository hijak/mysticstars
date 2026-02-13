import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { zodiacSigns } from "@/lib/zodiac-data"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReadingTabs } from "@/components/reading-tabs"
import { ArrowLeft } from "lucide-react"
import Aurora from "@/../../../../components/reactbits/Aurora"

interface SignPageProps {
  params: Promise<{ sign: string }>
}

export default async function SignPage({ params }: SignPageProps) {
  const { sign } = await params
  const signData = zodiacSigns.find((z) => z.sign.toLowerCase() === sign.toLowerCase())

  if (!signData) {
    notFound()
  }

  // Fetch horoscope data from API (complete + all readings in parallel)
  let horoscopeData
  let allReadingsData
  try {
    [horoscopeData, allReadingsData] = await Promise.all([
      apiClient.getCompleteHoroscope(sign),
      apiClient.getAllReadings(sign),
    ])
  } catch (error) {
    console.error(`Failed to fetch horoscope for ${sign}:`, error)
    notFound()
  }

  const { data: horoscope } = horoscopeData

  // Build readings object for tabs (daily, weekly, monthly, yearly)
  const readings = {
    daily: allReadingsData.data.daily,
    weekly: allReadingsData.data.weekly,
    monthly: allReadingsData.data.monthly,
    yearly: allReadingsData.data.yearly,
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <Aurora colorStops={["#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed"]} speed={3} blur={80} />
      </div>
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Signs
          </Button>
        </Link>

        {/* Sign Header */}
        <section className="text-center mb-12">
          <div className="inline-block relative mb-6">
            <span className="text-8xl md:text-9xl drop-shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-pulse">
              {signData.symbol}
            </span>
            <div className="absolute inset-0 blur-xl opacity-30 text-8xl md:text-9xl text-primary">
              {signData.symbol}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {signData.sign}
          </h1>

          <p className="text-lg text-muted-foreground mb-4">{signData.dates}</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-secondary/50">
              {signData.element} Sign
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Ruled by {signData.ruling}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mt-4">{today}</p>

          {horoscopeData.warnings && horoscopeData.warnings.length > 0 && (
            <div className="mt-4">
              {horoscopeData.warnings.map((warning, i) => (
                <p key={i} className="text-xs text-amber-500">⚠️ {warning}</p>
              ))}
            </div>
          )}
        </section>

        {/* Reading Tabs (Daily/Weekly/Monthly/Yearly) + Daily extras */}
        <section className="mb-12">
          <ReadingTabs
            readings={readings}
            love={horoscope.love}
            career={horoscope.career}
            health={horoscope.health}
            lucky={horoscope.lucky}
          />
        </section>

        {/* Navigation */}
        <section className="flex justify-center gap-4 flex-wrap">
          {zodiacSigns.map((z) => (
            <Link key={z.sign} href={`/sign/${z.sign.toLowerCase()}`}>
              <Button
                variant={z.sign.toLowerCase() === sign.toLowerCase() ? "default" : "ghost"}
                size="sm"
                className="text-lg"
              >
                {z.symbol}
              </Button>
            </Link>
          ))}
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
