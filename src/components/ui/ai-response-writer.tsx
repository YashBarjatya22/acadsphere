"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ResponseWriterProps = React.ComponentPropsWithoutRef<typeof ScrollArea> & {
  text: string;
};

export const AiResponseWriter = ({ text, className, ...props }: ResponseWriterProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current?.querySelector("div:first-child");
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [text]);

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("w-full", className)} {...props}>
      <div className="pr-4">
        <p className="text-foreground/80 text-sm whitespace-pre-line leading-relaxed">{text}</p>
      </div>
    </ScrollArea>
  );
};

export default AiResponseWriter;
