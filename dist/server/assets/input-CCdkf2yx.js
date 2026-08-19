import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "./router-DWxA6Z2f.js";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          // Editorial input — rounded, large touch target, thin border
          "flex h-11 w-full rounded-full border border-input bg-transparent",
          "px-4 py-2",
          "text-sm font-sans text-foreground",
          "placeholder:text-muted-foreground",
          "shadow-none",
          "transition-[border-color,box-shadow] duration-[120ms] ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "focus-visible:border-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "read-only:cursor-default",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
export {
  Input as I
};
