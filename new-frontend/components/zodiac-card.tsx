"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ZodiacCardProps {
  sign: string
  symbol: string
  dates: string
  element: string
}

export function ZodiacCard({ sign, symbol, dates, element }: ZodiacCardProps) {
  const elementColors = {
    Fire: "group-hover:shadow-orange-500/20",
    Earth: "group-hover:shadow-emerald-500/20",
    Air: "group-hover:shadow-sky-500/20",
    Water: "group-hover:shadow-blue-500/20",
  }

  return (
    <Link href={`/sign/${sign.toLowerCase()}`}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl cursor-pointer",
          elementColors[element as keyof typeof elementColors],
        )}
      >
        {/* Beam effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <CardContent className="p-6 relative z-10">
          <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
            {symbol}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {sign}
          </h3>
          <p className="text-sm text-muted-foreground">{dates}</p>
          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
            {element}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
