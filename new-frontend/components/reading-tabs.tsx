"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Calendar, CalendarDays, CalendarRange, Heart, Briefcase, Activity, Hash, Clock } from "lucide-react"
import { GlassOrb } from "@/components/glass-orb"

interface ReadingData {
  content: string
  validFrom: string
  validUntil: string
  generatedAt: string
  isCurrentlyValid: boolean
}

interface LuckyInfluences {
  number: number | null
  color: string | null
  time: string | null
}

interface ReadingTabsProps {
  readings: Record<string, ReadingData | undefined>
  love: string | null
  career: string | null
  health: string | null
  lucky: LuckyInfluences
}

const tabConfig = [
  { id: "daily", label: "Daily", icon: Sparkles, title: "Today's Reading" },
  { id: "weekly", label: "Weekly", icon: Calendar, title: "This Week's Reading" },
  { id: "monthly", label: "Monthly", icon: CalendarDays, title: "This Month's Reading" },
  { id: "yearly", label: "Yearly", icon: CalendarRange, title: "This Year's Reading" },
]

// Custom markdown components for styling
const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-primary/90">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-foreground/90">{children}</li>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mb-3 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mb-2 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-semibold mb-2 text-foreground">{children}</h3>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mb-4">{children}</blockquote>
  ),
}

function MarkdownContent({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function ReadingTabs({ readings, love, career, health, lucky }: ReadingTabsProps) {
  const [activeTab, setActiveTab] = useState("daily")

  const detailedReadings = [
    { icon: Heart, title: "Love & Relationships", content: love, color: "text-pink-400" },
    { icon: Briefcase, title: "Career & Finance", content: career, color: "text-amber-400" },
    { icon: Activity, title: "Health & Wellness", content: health, color: "text-emerald-400" },
  ]

  return (
    <div className="space-y-12">
      <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm border border-border/50">
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((tab) => {
          const reading = readings[tab.id]
          return (
            <TabsContent key={tab.id} value={tab.id}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <tab.icon className="w-5 h-5 text-primary" />
                    {tab.title}
                  </CardTitle>
                  {reading && (
                    <p className="text-xs text-muted-foreground">
                      Valid: {new Date(reading.validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(reading.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {reading?.content ? (
                    <MarkdownContent 
                      content={reading.content} 
                      className="text-foreground/90 leading-relaxed text-lg prose-headings:text-foreground" 
                    />
                  ) : (
                    <p className="text-muted-foreground italic">
                      {tab.label} reading not available at this time.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Love, Career, Health - Only shown for Daily tab */}
      {activeTab === "daily" && (
        <>
          <section className="grid md:grid-cols-3 gap-6">
            {detailedReadings.map((section) => (
              <Card
                key={section.title}
                className="bg-card/30 border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.content ? (
                    <MarkdownContent 
                      content={section.content} 
                      className="text-sm text-muted-foreground leading-relaxed" 
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Reading not available at this time.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Lucky Influences - Only shown for Daily tab */}
          <section>
            <Card className="bg-gradient-to-br from-card/50 to-secondary/30 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Lucky Influences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{lucky.number ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Lucky Number</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-3">
                      <GlassOrb color={lucky.color} size="md" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{lucky.color ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Lucky Color</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{lucky.time ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">Power Hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
