import { jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { c as cn } from "./router-DWxA6Z2f.js";
const badgeVariants = cva(
  // Base — Space Mono, uppercase, pill shape, no shadows
  [
    "inline-flex items-center",
    "rounded-full",
    "font-mono font-normal",
    "text-[10px] uppercase tracking-[0.1em]",
    "px-2.5 py-[3px]",
    "transition-colors duration-[120ms]",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "select-none"
  ].join(" "),
  {
    variants: {
      variant: {
        // Dark fill — primary badge
        default: "bg-foreground text-background border border-transparent",
        // Soft gray — secondary badge
        secondary: "bg-muted text-muted-foreground border border-border",
        // Border only — minimal badge
        outline: "bg-transparent text-foreground border border-border",
        // Muted cream — softest badge
        ghost: "bg-transparent text-muted-foreground border-none",
        // Status: positive (gray-scale, not green)
        positive: "bg-muted text-foreground border border-border",
        // Status: warning (gray-scale, not amber)
        warning: "bg-muted text-muted-foreground border border-border",
        // Status: destructive (dark, not red)
        destructive: "bg-foreground text-background border border-transparent"
      }
    },
    defaultVariants: {
      variant: "secondary"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
export {
  Badge as B
};
