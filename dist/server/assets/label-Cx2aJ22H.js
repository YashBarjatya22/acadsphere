import { jsx } from "react/jsx-runtime";
import { c as cn } from "./utils-H80jjgLf.js";
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "label",
    {
      "data-slot": "label",
      className: cn(
        // Space Mono micro-label — editorial style
        "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground",
        "leading-none",
        "select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
export {
  Label as L
};
