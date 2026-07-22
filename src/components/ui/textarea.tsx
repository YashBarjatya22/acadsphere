import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Editorial textarea — rounded, not pill, generous spacing
        "flex min-h-[100px] w-full rounded-xl border border-input bg-transparent",
        "px-4 py-3",
        "text-sm font-sans text-foreground",
        "placeholder:text-muted-foreground",
        "shadow-none resize-y",
        "transition-[border-color,box-shadow] duration-[120ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        "focus-visible:border-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
