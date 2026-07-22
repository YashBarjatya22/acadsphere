import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
      "border border-border",
      "transition-colors duration-[200ms] ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Unchecked: muted background
      "bg-muted",
      // Checked: black background
      "data-[state=checked]:bg-foreground data-[state=checked]:border-foreground",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full",
        "shadow-none",
        "ring-0",
        "transition-transform duration-[200ms] ease-out",
        // Unchecked: cream thumb
        "bg-muted-foreground",
        "translate-x-[3px]",
        // Checked: cream/background thumb, shifted right
        "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-background",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
