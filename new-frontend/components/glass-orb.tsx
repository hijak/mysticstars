"use client"

import { getColorValue } from "@/lib/color-utils"

interface GlassOrbProps {
  color: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
}

export function GlassOrb({ color, size = "md", className = "" }: GlassOrbProps) {
  const colorValue = getColorValue(color)
  
  return (
    <div
      className={`relative rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        background: `
          radial-gradient(
            ellipse 50% 30% at 50% 20%,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.3) 40%,
            transparent 70%
          ),
          radial-gradient(
            ellipse 80% 80% at 50% 50%,
            ${colorValue} 0%,
            color-mix(in srgb, ${colorValue} 70%, black) 100%
          )
        `,
        boxShadow: `
          inset 0 -8px 16px rgba(0, 0, 0, 0.3),
          inset 0 4px 8px rgba(255, 255, 255, 0.2),
          0 4px 12px color-mix(in srgb, ${colorValue} 50%, transparent),
          0 0 20px color-mix(in srgb, ${colorValue} 30%, transparent)
        `,
      }}
    >
      {/* Inner highlight - top shine effect */}
      <div
        className="absolute rounded-full"
        style={{
          top: "8%",
          left: "20%",
          width: "40%",
          height: "25%",
          background: `
            radial-gradient(
              ellipse at center,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.4) 40%,
              transparent 70%
            )
          `,
          filter: "blur(1px)",
        }}
      />
      
      {/* Secondary subtle highlight */}
      <div
        className="absolute rounded-full"
        style={{
          top: "15%",
          right: "15%",
          width: "20%",
          height: "15%",
          background: `
            radial-gradient(
              ellipse at center,
              rgba(255, 255, 255, 0.5) 0%,
              transparent 70%
            )
          `,
          filter: "blur(0.5px)",
        }}
      />
      
      {/* Bottom reflection */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "15%",
          background: `
            radial-gradient(
              ellipse at center,
              rgba(255, 255, 255, 0.15) 0%,
              transparent 70%
            )
          `,
        }}
      />
    </div>
  )
}
