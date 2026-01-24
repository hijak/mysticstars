import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <div className="absolute inset-0 blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Mystic Stars
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            All Signs
          </Link>
          <Link href="/readings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            All Readings
          </Link>
          <Link href="/#daily" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Daily Reading
          </Link>
        </nav>
      </div>
    </header>
  )
}
