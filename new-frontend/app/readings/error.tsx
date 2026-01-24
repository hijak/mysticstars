"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { GridBeam } from "@/components/beam-effect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="relative min-h-screen">

      <GridBeam />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>

            <h2 className="text-2xl font-bold mb-4">Unable to Load Readings</h2>

            <p className="text-muted-foreground mb-8">
              {error.message || "We couldn't fetch the horoscope readings at this time. This might be due to a temporary issue with our servers."}
            </p>

            <div className="flex justify-center gap-4">
              <Button onClick={reset} variant="default">
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {error.digest && (
              <p className="text-xs text-muted-foreground mt-6">
                Error ID: {error.digest}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
