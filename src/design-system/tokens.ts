/**
 * AcadSphere Design System — TypeScript Tokens
 * Use these constants in className composition for consistent design.
 */

export const colors = {
  // Palette
  black:     "#0A0A0A",
  white:     "#FFFFFF",
  cream:     "#F7F5F0",
  creamSoft: "#F0EDE6",
  // Gray scale
  gray50:  "#FAFAF8",
  gray100: "#F4F2EC",
  gray200: "#E8E5DC",
  gray300: "#D4D0C4",
  gray400: "#B8B3A3",
  gray500: "#8C8778",
  gray600: "#6B6659",
  gray700: "#4A4640",
  gray800: "#2E2B26",
  gray900: "#1A1714",
} as const;

export const fonts = {
  sans:  "Switzer, Inter, system-ui, sans-serif",
  mono:  "Space Mono, ui-monospace, monospace",
} as const;

export const spacing = {
  xs:  "0.5rem",   // 8px
  sm:  "1rem",     // 16px
  md:  "1.5rem",   // 24px
  lg:  "2rem",     // 32px
  xl:  "3rem",     // 48px
  "2xl": "4rem",   // 64px
  "3xl": "6rem",   // 96px
} as const;

export const radius = {
  xs:   "2px",
  sm:   "4px",
  md:   "8px",
  lg:   "12px",
  xl:   "16px",
  "2xl":"20px",
  full: "9999px",
} as const;

export const typography = {
  // Sizes
  xs:   "0.6875rem", // 11px — mono labels
  sm:   "0.75rem",   // 12px
  base: "0.875rem",  // 14px
  md:   "1rem",      // 16px
  lg:   "1.125rem",  // 18px
  xl:   "1.25rem",   // 20px
  "2xl":"1.5rem",    // 24px
  "3xl":"1.875rem",  // 30px
  "4xl":"2.25rem",   // 36px
  "5xl":"3rem",      // 48px
  // Weights
  regular: "400",
  medium:  "500",
  semibold:"600",
  bold:    "700",
  extrabold:"800",
  // Tracking
  tightDisplay: "-0.04em",
  tight:        "-0.03em",
  normal:       "0",
  wideMono:     "0.08em",
  widestMono:   "0.12em",
} as const;

export const motion = {
  durationFast:  "120ms",
  durationBase:  "200ms",
  durationSlow:  "300ms",
  easeOut:       "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut:     "cubic-bezier(0.4, 0, 0.2, 1)",
  transition:    "opacity 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1)",
} as const;

export const layout = {
  maxWidth:   "1440px",
  contentWidth: "1280px",
  sidebarWidth: "240px",
  headerHeight: "56px",
} as const;

/**
 * Tailwind className helpers for common patterns
 */
export const tw = {
  // Text styles
  monoLabel:  "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
  displayHead:"font-sans font-extrabold tracking-[-0.04em] leading-[1.05]",
  bodyText:   "font-sans text-sm text-muted-foreground leading-relaxed",
  // Cards
  card:       "bg-card border border-border rounded-2xl p-7",
  cardSm:     "bg-card border border-border rounded-xl p-5",
  // Buttons
  btnPrimary: "font-mono text-[11px] uppercase tracking-[0.08em] rounded-full px-7 py-4 bg-foreground text-background transition-opacity duration-[120ms] hover:opacity-80",
  btnOutline: "font-mono text-[11px] uppercase tracking-[0.08em] rounded-full px-7 py-4 border border-border bg-transparent text-foreground transition-colors duration-[120ms] hover:bg-accent",
  btnGhost:   "font-mono text-[11px] uppercase tracking-[0.08em] rounded-full px-5 py-3 bg-transparent text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
  // Badges
  badge:      "font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground",
  badgeDark:  "font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full bg-foreground text-background",
  // Input
  input:      "h-11 w-full rounded-full border border-input bg-transparent px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-[120ms]",
  // Dividers
  dividerH:   "border-t border-border",
  dividerV:   "border-l border-border",
} as const;
