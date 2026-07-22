import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        // Space Mono micro-label — editorial style
        "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
        "leading-none",
        "select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
