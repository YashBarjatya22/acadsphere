"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group font-mono"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-none group-[.toaster]:font-sans group-[.toaster]:text-sm",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:font-mono group-[.toast]:text-[10px] group-[.toast]:uppercase group-[.toast]:tracking-[0.08em] group-[.toast]:rounded-full group-[.toast]:px-4",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:text-[10px] group-[.toast]:uppercase group-[.toast]:tracking-[0.08em] group-[.toast]:rounded-full group-[.toast]:px-4",
          success:
            "group-[.toaster]:border-border",
          error:
            "group-[.toaster]:border-border",
          warning:
            "group-[.toaster]:border-border",
          info:
            "group-[.toaster]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
