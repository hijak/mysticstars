// Map common color names to CSS colors for the lucky color orb
const colorMap: Record<string, string> = {
  // Basic colors
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  white: "#f8fafc",
  black: "#1e293b",
  gray: "#6b7280",
  grey: "#6b7280",
  brown: "#92400e",
  
  // Shades and variants
  gold: "#fbbf24",
  golden: "#fbbf24",
  silver: "#94a3b8",
  bronze: "#cd7f32",
  copper: "#b87333",
  
  // Reds and pinks
  crimson: "#dc2626",
  scarlet: "#ef4444",
  rose: "#f43f5e",
  coral: "#fb7185",
  salmon: "#fca5a5",
  maroon: "#7f1d1d",
  ruby: "#e11d48",
  burgundy: "#881337",
  magenta: "#d946ef",
  fuchsia: "#d946ef",
  
  // Oranges
  peach: "#fed7aa",
  tangerine: "#fb923c",
  apricot: "#fdba74",
  amber: "#f59e0b",
  
  // Yellows
  lemon: "#fef08a",
  cream: "#fef3c7",
  ivory: "#fffbeb",
  beige: "#d6d3d1",
  
  // Greens
  lime: "#84cc16",
  mint: "#86efac",
  emerald: "#10b981",
  jade: "#059669",
  olive: "#65a30d",
  forest: "#166534",
  sage: "#9ca38f",
  teal: "#14b8a6",
  turquoise: "#2dd4bf",
  aqua: "#22d3ee",
  cyan: "#06b6d4",
  seafoam: "#5eead4",
  
  // Blues
  navy: "#1e3a8a",
  royal: "#4f46e5",
  sky: "#0ea5e9",
  azure: "#0284c7",
  cobalt: "#2563eb",
  sapphire: "#1d4ed8",
  indigo: "#6366f1",
  midnight: "#1e1b4b",
  ocean: "#0369a1",
  
  // Purples
  violet: "#8b5cf6",
  lavender: "#c4b5fd",
  plum: "#a21caf",
  grape: "#7c3aed",
  lilac: "#d8b4fe",
  mauve: "#c084fc",
  amethyst: "#9333ea",
  orchid: "#d946ef",
  
  // Earth tones
  chocolate: "#78350f",
  coffee: "#451a03",
  caramel: "#b45309",
  tan: "#d6b68c",
  sand: "#e7e5e4",
  terracotta: "#c2410c",
  rust: "#ea580c",
  sienna: "#a16207",
  
  // Neutrals
  charcoal: "#374151",
  slate: "#475569",
  smoke: "#9ca3af",
  pearl: "#f1f5f9",
  ash: "#a8a29e",
}

/**
 * Convert a color name to a CSS color value
 * Returns a default purple if the color is not found
 */
export function getColorValue(colorName: string | null): string {
  if (!colorName) return "#a855f7" // default purple
  
  const normalized = colorName.toLowerCase().trim()
  
  // Direct match
  if (colorMap[normalized]) {
    return colorMap[normalized]
  }
  
  // Try to find a partial match (e.g., "Deep Blue" -> "blue")
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalized.includes(key)) {
      return value
    }
  }
  
  // If it looks like a hex color, return it directly
  if (normalized.startsWith("#") && (normalized.length === 4 || normalized.length === 7)) {
    return normalized
  }
  
  // If it's a valid CSS color name, try returning it
  if (CSS.supports && CSS.supports("color", normalized)) {
    return normalized
  }
  
  // Default fallback
  return "#a855f7"
}

/**
 * Get a lighter version of a color for gradient effects
 */
export function getLighterColor(color: string): string {
  // Simple approach: mix with white
  return `color-mix(in srgb, ${color} 60%, white)`
}

/**
 * Get a darker version of a color for gradient effects
 */
export function getDarkerColor(color: string): string {
  // Simple approach: mix with black
  return `color-mix(in srgb, ${color} 70%, black)`
}
