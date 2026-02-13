import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AuroraBlur from "@/components/react-bits/aurora-blur"

const defaultColors = ["#8b5cf6", "#a78bfa", "#7c3aed"]

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden">
      <AuroraBlur
        width="100%"
        height="100vh"
        speed={0.3}
        brightness={0.5}
        opacity={0.45}
        movementX={-0.5}
        movementY={-3}
        verticalFade={0.75}
        bloomIntensity={2.3}
        layers={[
          { color: defaultColors[0], speed: 0.4, intensity: 0.5 },
          { color: defaultColors[1], speed: 0.2, intensity: 0.4 },
          { color: defaultColors[2], speed: 0.3, intensity: 0.3 },
        ]}
      />
      </div>
        opacity={0.45}
        movementX={-0.5}
        movementY={-3}
        verticalFade={0.75}
        bloomIntensity={2.3}
        layers={[
          { color: defaultColors[0], speed: 0.4, intensity: 0.5 },
          { color: defaultColors[1], speed: 0.2, intensity: 0.4 },
          { color: defaultColors[2], speed: 0.3, intensity: 0.3 },
        ]}
      />
      </div>
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Skeleton Header */}
        <section className="text-center mb-12">
          <Skeleton className="w-32 h-32 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-64 mx-auto mb-6" />
          <div className="flex justify-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </section>

        {/* Skeleton Daily Reading */}
        <section className="mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </section>

        {/* Skeleton Detailed Readings Grid */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/30 border-border/50">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Skeleton Lucky Section */}
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-card/50 to-secondary/30 border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
