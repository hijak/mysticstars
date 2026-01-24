"use client"

import { LightRays } from "@/components/magicui/light-rays"

export function BeamEffect() {
  return null
}

export function GridBeam() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <LightRays />
    </div>
  )
}
