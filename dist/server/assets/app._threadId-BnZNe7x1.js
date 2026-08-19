import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn } from "./createSsrRpc-BYlyULqi.js";
import { C as ChatLayout, g as getThreadMessages } from "./ChatLayout-C_4Dd4n9.js";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import * as React from "react";
import { useCallback, memo, createContext, useRef, useState, useEffect, useMemo, useContext } from "react";
import { supabase } from "./client-h4N4kZKq.js";
import { B as Button } from "./button-CUmEMVhO.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { ArrowDownIcon, X, Search, ChevronRight, Check, Circle, CornerDownLeftIcon, SquareIcon, XIcon, Sparkle, Brain } from "lucide-react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cva } from "class-variance-authority";
import "clsx";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import { Command as Command$1 } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import "./input-poeoKceV.js";
import { T as Textarea } from "./textarea-bZdI8Am0.js";
import "./select-DmEazsxn.js";
import { S as Spinner } from "./spinner-D3GgUm1d.js";
import { nanoid } from "nanoid";
import { motion } from "motion/react";
import { toast } from "sonner";
import "./server-ClIdw9oM.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-DcSfQrdP.js";
import "./supabase.server-BXfiGlvE.js";
import "@supabase/supabase-js";
import "dotenv";
import "./db.server-DqdqqPAh.js";
import "node:sqlite";
import "node:path";
import "node:dns";
import "node:crypto";
import "zod";
import "./studentos-logo-CCLo3MN1.js";
import "./avatar-B-EjQ9LK.js";
import "@radix-ui/react-avatar";
import "@radix-ui/react-slot";
import "tailwind-merge";
import "@radix-ui/react-select";
const Conversation = ({ className, ...props }) => /* @__PURE__ */ jsx(
  StickToBottom,
  {
    className: cn("relative flex-1 overflow-y-hidden", className),
    initial: "smooth",
    resize: "smooth",
    role: "log",
    ...props
  }
);
const ConversationContent = ({ className, ...props }) => /* @__PURE__ */ jsx(StickToBottom.Content, { className: cn("flex flex-col gap-8 p-4", className), ...props });
const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    ),
    ...props,
    children: children ?? /* @__PURE__ */ jsxs(Fragment, { children: [
      icon && /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: icon }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: description })
      ] })
    ] })
  }
);
const ConversationScrollButton = ({
  className,
  ...props
}) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);
  return !isAtBottom && /* @__PURE__ */ jsx(
    Button,
    {
      className: cn(
        "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted",
        className
      ),
      onClick: handleScrollToBottom,
      size: "icon",
      type: "button",
      variant: "outline",
      ...props,
      children: /* @__PURE__ */ jsx(ArrowDownIcon, { className: "size-4" })
    }
  );
};
const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none"
      }
    },
    defaultVariants: {
      orientation: "horizontal"
    }
  }
);
const TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-lg",
      "border border-border bg-foreground",
      "px-3 py-1.5",
      "font-mono text-[10px] uppercase tracking-[0.08em] text-background",
      "shadow-none",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const Message = ({ className, from, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
      className
    ),
    ...props
  }
);
const MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
      "group-[.is-assistant]:text-foreground",
      className
    ),
    ...props,
    children
  }
);
createContext(null);
const streamdownPlugins = { cjk, code, math, mermaid };
const MessageResponse = memo(
  ({ className, ...props }) => /* @__PURE__ */ jsx(
    Streamdown,
    {
      className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
      plugins: streamdownPlugins,
      ...props
    }
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating
);
MessageResponse.displayName = "MessageResponse";
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50",
      "bg-black/40 backdrop-blur-[2px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
        "translate-x-[-50%] translate-y-[-50%]",
        "rounded-2xl border border-border bg-card text-card-foreground",
        "p-8 shadow-none",
        "duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(
          DialogPrimitive.Close,
          {
            className: cn(
              "absolute right-5 top-5",
              "rounded-full p-1.5",
              "text-muted-foreground",
              "transition-colors duration-[120ms]",
              "hover:bg-accent hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:pointer-events-none"
            ),
            children: [
              /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
            ]
          }
        )
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn(
      "font-sans font-semibold text-xl tracking-tight text-foreground leading-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground leading-relaxed", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const Command = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Command$1,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = Command$1.displayName;
const CommandInput = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsx(
    Command$1.Input,
    {
      ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = Command$1.Input.displayName;
const CommandList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Command$1.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = Command$1.List.displayName;
const CommandEmpty = React.forwardRef((props, ref) => /* @__PURE__ */ jsx(Command$1.Empty, { ref, className: "py-6 text-center text-sm", ...props }));
CommandEmpty.displayName = Command$1.Empty.displayName;
const CommandGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Command$1.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = Command$1.Group.displayName;
const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Command$1.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props
  }
));
CommandSeparator.displayName = Command$1.Separator.displayName;
const CommandItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Command$1.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    ),
    ...props
  }
));
CommandItem.displayName = Command$1.Item.displayName;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm",
      "outline-none transition-colors duration-[120ms]",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-2",
      "text-popover-foreground shadow-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-popover p-2",
      "text-popover-foreground shadow-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2",
      "text-sm font-sans text-foreground",
      "outline-none transition-colors duration-[120ms]",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3",
      "text-sm font-sans outline-none transition-colors duration-[120ms]",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-foreground" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3",
      "text-sm font-sans outline-none transition-colors duration-[120ms]",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-foreground text-foreground" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-2 my-1 h-px bg-border", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  HoverCardPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-hover-card-content-transform-origin)",
      className
    ),
    ...props
  }
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
function InputGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "input-group",
      role: "group",
      className: cn(
        "group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]",
        "h-9 has-[>textarea]:h-auto",
        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1",
        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className
      ),
      ...props
    }
  );
}
const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
        "block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
      }
    },
    defaultVariants: {
      align: "inline-start"
    }
  }
);
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "data-slot": "input-group-addon",
      "data-align": align,
      className: cn(inputGroupAddonVariants({ align }), className),
      onClick: (e) => {
        if (e.target.closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      },
      ...props
    }
  );
}
const inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
      "icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
      "icon-sm": "size-8 p-0 has-[>svg]:p-0"
    }
  },
  defaultVariants: {
    size: "xs"
  }
});
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button,
    {
      type,
      "data-size": size,
      variant,
      className: cn(inputGroupButtonVariants({ size }), className),
      ...props
    }
  );
}
function InputGroupTextarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Textarea,
    {
      "data-slot": "input-group-control",
      className: cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      ),
      ...props
    }
  );
}
const convertBlobUrlToDataUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};
const PromptInputController = createContext(null);
const ProviderAttachmentsContext = createContext(null);
const useOptionalPromptInputController = () => useContext(PromptInputController);
const useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);
const LocalAttachmentsContext = createContext(null);
const usePromptInputAttachments = () => {
  const provider = useOptionalProviderAttachments();
  const local = useContext(LocalAttachmentsContext);
  const context = local ?? provider;
  if (!context) {
    throw new Error(
      "usePromptInputAttachments must be used within a PromptInput or PromptInputProvider"
    );
  }
  return context;
};
const LocalReferencedSourcesContext = createContext(null);
const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}) => {
  const controller = useOptionalPromptInputController();
  const usingProvider = !!controller;
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const [items, setItems] = useState([]);
  const files = usingProvider ? controller.attachments.files : items;
  const [referencedSources, setReferencedSources] = useState([]);
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  const openFileDialogLocal = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const matchesAccept = useCallback(
    (f) => {
      if (!accept || accept.trim() === "") {
        return true;
      }
      const patterns = accept.split(",").map((s) => s.trim()).filter(Boolean);
      return patterns.some((pattern) => {
        if (pattern.endsWith("/*")) {
          const prefix = pattern.slice(0, -1);
          return f.type.startsWith(prefix);
        }
        return f.type === pattern;
      });
    },
    [accept]
  );
  const addLocal = useCallback(
    (fileList) => {
      const incoming = [...fileList];
      const accepted = incoming.filter((f) => matchesAccept(f));
      if (incoming.length && accepted.length === 0) {
        onError?.({
          code: "accept",
          message: "No files match the accepted types."
        });
        return;
      }
      const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
      const sized = accepted.filter(withinSize);
      if (accepted.length > 0 && sized.length === 0) {
        onError?.({
          code: "max_file_size",
          message: "All files exceed the maximum size."
        });
        return;
      }
      setItems((prev) => {
        const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
        const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
        if (typeof capacity === "number" && sized.length > capacity) {
          onError?.({
            code: "max_files",
            message: "Too many files. Some were not added."
          });
        }
        const next = [];
        for (const file of capped) {
          next.push({
            filename: file.name,
            id: nanoid(),
            mediaType: file.type,
            type: "file",
            url: URL.createObjectURL(file)
          });
        }
        return [...prev, ...next];
      });
    },
    [matchesAccept, maxFiles, maxFileSize, onError]
  );
  const removeLocal = useCallback(
    (id) => setItems((prev) => {
      const found = prev.find((file) => file.id === id);
      if (found?.url) {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((file) => file.id !== id);
    }),
    []
  );
  const addWithProviderValidation = useCallback(
    (fileList) => {
      const incoming = [...fileList];
      const accepted = incoming.filter((f) => matchesAccept(f));
      if (incoming.length && accepted.length === 0) {
        onError?.({
          code: "accept",
          message: "No files match the accepted types."
        });
        return;
      }
      const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
      const sized = accepted.filter(withinSize);
      if (accepted.length > 0 && sized.length === 0) {
        onError?.({
          code: "max_file_size",
          message: "All files exceed the maximum size."
        });
        return;
      }
      const currentCount = files.length;
      const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
      const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
      if (typeof capacity === "number" && sized.length > capacity) {
        onError?.({
          code: "max_files",
          message: "Too many files. Some were not added."
        });
      }
      if (capped.length > 0) {
        controller?.attachments.add(capped);
      }
    },
    [matchesAccept, maxFileSize, maxFiles, onError, files.length, controller]
  );
  const clearAttachments = useCallback(
    () => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
      for (const file of prev) {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      }
      return [];
    }),
    [usingProvider, controller]
  );
  const clearReferencedSources = useCallback(() => setReferencedSources([]), []);
  const add = usingProvider ? addWithProviderValidation : addLocal;
  const remove = usingProvider ? controller.attachments.remove : removeLocal;
  const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
  const clear = useCallback(() => {
    clearAttachments();
    clearReferencedSources();
  }, [clearAttachments, clearReferencedSources]);
  useEffect(() => {
    if (!usingProvider) {
      return;
    }
    controller.__registerFileInput(inputRef, () => inputRef.current?.click());
  }, [usingProvider, controller]);
  useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = "";
    }
  }, [files, syncHiddenInput]);
  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    if (globalDrop) {
      return;
    }
    const onDragOver = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDrop = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    form.addEventListener("dragover", onDragOver);
    form.addEventListener("drop", onDrop);
    return () => {
      form.removeEventListener("dragover", onDragOver);
      form.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop]);
  useEffect(() => {
    if (!globalDrop) {
      return;
    }
    const onDragOver = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDrop = (e) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        add(e.dataTransfer.files);
      }
    };
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop]);
  useEffect(
    () => () => {
      if (!usingProvider) {
        for (const f of filesRef.current) {
          if (f.url) {
            URL.revokeObjectURL(f.url);
          }
        }
      }
    },
    [usingProvider]
  );
  const handleChange = useCallback(
    (event) => {
      if (event.currentTarget.files) {
        add(event.currentTarget.files);
      }
      event.currentTarget.value = "";
    },
    [add]
  );
  const attachmentsCtx = useMemo(
    () => ({
      add,
      clear: clearAttachments,
      fileInputRef: inputRef,
      files: files.map((item) => ({ ...item, id: item.id })),
      openFileDialog,
      remove
    }),
    [files, add, remove, clearAttachments, openFileDialog]
  );
  const refsCtx = useMemo(
    () => ({
      add: (incoming) => {
        const array = Array.isArray(incoming) ? incoming : [incoming];
        setReferencedSources((prev) => [...prev, ...array.map((s) => ({ ...s, id: nanoid() }))]);
      },
      clear: clearReferencedSources,
      remove: (id) => {
        setReferencedSources((prev) => prev.filter((s) => s.id !== id));
      },
      sources: referencedSources
    }),
    [referencedSources, clearReferencedSources]
  );
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const text = usingProvider ? controller.textInput.value : (() => {
        const formData = new FormData(form);
        return formData.get("message") || "";
      })();
      if (!usingProvider) {
        form.reset();
      }
      try {
        const convertedFiles = await Promise.all(
          files.map(async ({ id: _id, ...item }) => {
            if (item.url?.startsWith("blob:")) {
              const dataUrl = await convertBlobUrlToDataUrl(item.url);
              return {
                ...item,
                url: dataUrl ?? item.url
              };
            }
            return item;
          })
        );
        const result = onSubmit({ files: convertedFiles, text }, event);
        if (result instanceof Promise) {
          try {
            await result;
            clear();
            if (usingProvider) {
              controller.textInput.clear();
            }
          } catch {
          }
        } else {
          clear();
          if (usingProvider) {
            controller.textInput.clear();
          }
        }
      } catch {
      }
    },
    [usingProvider, controller, files, onSubmit, clear]
  );
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        accept,
        "aria-label": "Upload files",
        className: "hidden",
        multiple,
        onChange: handleChange,
        ref: inputRef,
        title: "Upload files",
        type: "file"
      }
    ),
    /* @__PURE__ */ jsx("form", { className: cn("w-full", className), onSubmit: handleSubmit, ref: formRef, ...props, children: /* @__PURE__ */ jsx(InputGroup, { className: "overflow-hidden", children }) })
  ] });
  const withReferencedSources = /* @__PURE__ */ jsx(LocalReferencedSourcesContext.Provider, { value: refsCtx, children: inner });
  return /* @__PURE__ */ jsx(LocalAttachmentsContext.Provider, { value: attachmentsCtx, children: withReferencedSources });
};
const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  ...props
}) => {
  const controller = useOptionalPromptInputController();
  const attachments = usePromptInputAttachments();
  const [isComposing, setIsComposing] = useState(false);
  const handleKeyDown = useCallback(
    (e) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) {
        return;
      }
      if (e.key === "Enter") {
        if (isComposing || e.nativeEvent.isComposing) {
          return;
        }
        if (e.shiftKey) {
          return;
        }
        e.preventDefault();
        const { form } = e.currentTarget;
        const submitButton = form?.querySelector(
          'button[type="submit"]'
        );
        if (submitButton?.disabled) {
          return;
        }
        form?.requestSubmit();
      }
      if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
        e.preventDefault();
        const lastAttachment = attachments.files.at(-1);
        if (lastAttachment) {
          attachments.remove(lastAttachment.id);
        }
      }
    },
    [onKeyDown, isComposing, attachments]
  );
  const handlePaste = useCallback(
    (event) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }
      const files = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        event.preventDefault();
        attachments.add(files);
      }
    },
    [attachments]
  );
  const handleCompositionEnd = useCallback(() => setIsComposing(false), []);
  const handleCompositionStart = useCallback(() => setIsComposing(true), []);
  const controlledProps = controller ? {
    onChange: (e) => {
      controller.textInput.setInput(e.currentTarget.value);
      onChange?.(e);
    },
    value: controller.textInput.value
  } : {
    onChange
  };
  return /* @__PURE__ */ jsx(
    InputGroupTextarea,
    {
      className: cn("field-sizing-content max-h-48 min-h-16", className),
      name: "message",
      onCompositionEnd: handleCompositionEnd,
      onCompositionStart: handleCompositionStart,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      placeholder,
      ...props,
      ...controlledProps
    }
  );
};
const PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  InputGroupAddon,
  {
    align: "block-end",
    className: cn("justify-between gap-1", className),
    ...props
  }
);
const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon-sm",
  status,
  onStop,
  onClick,
  children,
  ...props
}) => {
  const isGenerating = status === "submitted" || status === "streaming";
  let Icon = /* @__PURE__ */ jsx(CornerDownLeftIcon, { className: "size-4" });
  if (status === "submitted") {
    Icon = /* @__PURE__ */ jsx(Spinner, {});
  } else if (status === "streaming") {
    Icon = /* @__PURE__ */ jsx(SquareIcon, { className: "size-4" });
  } else if (status === "error") {
    Icon = /* @__PURE__ */ jsx(XIcon, { className: "size-4" });
  }
  const handleClick = useCallback(
    (e) => {
      if (isGenerating && onStop) {
        e.preventDefault();
        onStop();
        return;
      }
      onClick?.(e);
    },
    [isGenerating, onStop, onClick]
  );
  return /* @__PURE__ */ jsx(
    InputGroupButton,
    {
      "aria-label": isGenerating ? "Stop" : "Submit",
      className: cn(className),
      onClick: handleClick,
      size,
      type: isGenerating && onStop ? "button" : "submit",
      variant,
      ...props,
      children: children ?? Icon
    }
  );
};
const motionComponentCache = /* @__PURE__ */ new Map();
const getMotionComponent = (element) => {
  let component = motionComponentCache.get(element);
  if (!component) {
    component = motion.create(element);
    motionComponentCache.set(element, component);
  }
  return component;
};
const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2
}) => {
  const MotionComponent = getMotionComponent(Component);
  const dynamicSpread = useMemo(() => (children?.length ?? 0) * spread, [children, spread]);
  return /* @__PURE__ */ jsx(
    MotionComponent,
    {
      animate: { backgroundPosition: "0% center" },
      className: cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className
      ),
      initial: { backgroundPosition: "100% center" },
      style: {
        "--spread": `${dynamicSpread}px`,
        backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
      },
      transition: {
        duration,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY
      },
      children
    }
  );
};
const Shimmer = memo(ShimmerComponent);
const STARTERS = [
  "Build me a 6-month MCA → Full Stack roadmap",
  "Score my resume against SDE-1 roles",
  "Upload my notes and scan for gaps",
  "Explain transactions in DBMS with exam questions",
  "Show me example exam questions for Operating Systems"
];
function ChatWindow({
  threadId,
  initialMessages
}) {
  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ threadId }),
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token || (typeof window !== "undefined" ? localStorage.getItem("demo_session_token") : null) || "demo_session_token";
        return { Authorization: `Bearer ${token}` };
      }
    })
  );
  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: transportRef.current,
    onError: (e) => {
      console.error(e);
      toast.error("AI request failed. Try again.");
    }
  });
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);
  const busy = status === "submitted" || status === "streaming";
  async function handleSubmit(_msg, e) {
    e.preventDefault();
    const { text: rawText, files } = _msg;
    const text = (rawText ?? input).trim();
    const hasFiles = !!files?.length;
    if (!text && !hasFiles || busy) return;
    setInput("");
    const prompt = text || hasFiles ? text || "Scan the uploaded notes for concept gaps and missing topics relative to a technical student target role or exam syllabus. If gaps are found, list them with fixes. If there are no gaps, say the notes look solid and give a short appreciative message." : text;
    await sendMessage({
      text: prompt,
      files
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs(Conversation, { className: "flex-1", children: [
      /* @__PURE__ */ jsxs(ConversationContent, { className: "mx-auto w-full max-w-3xl", children: [
        messages.length === 0 ? /* @__PURE__ */ jsx(
          ConversationEmptyState,
          {
            icon: /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(Brain, { className: "h-6 w-6" }) }),
            title: "Where should your student journey go next?",
            description: "StudentOS guides your profile, career, learning, research, and placement readiness in one unified experience.",
            children: /* @__PURE__ */ jsx("div", { className: "mt-4 grid w-full max-w-xl gap-2 sm:grid-cols-2", children: STARTERS.map((s) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  setInput(s);
                  textareaRef.current?.focus();
                },
                className: "rounded-lg border border-border bg-surface px-3 py-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-card hover:text-foreground",
                children: [
                  /* @__PURE__ */ jsx(Sparkle, { className: "mb-1 h-3.5 w-3.5 text-primary" }),
                  s
                ]
              },
              s
            )) })
          }
        ) : messages.map((m) => {
          const text = m.parts.map((p) => p.type === "text" ? p.text : "").join("");
          return /* @__PURE__ */ jsx(Message, { from: m.role, children: /* @__PURE__ */ jsx(MessageContent, { children: m.role === "assistant" ? /* @__PURE__ */ jsx(MessageResponse, { children: text }) : /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap", children: text }) }) }, m.id);
        }),
        status === "submitted" && /* @__PURE__ */ jsx(Message, { from: "assistant", children: /* @__PURE__ */ jsx(MessageContent, { children: /* @__PURE__ */ jsx(Shimmer, { children: "Thinking…" }) }) }),
        error && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive", children: error.message })
      ] }),
      /* @__PURE__ */ jsx(ConversationScrollButton, {})
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-3xl px-4 pb-6", children: [
      /* @__PURE__ */ jsxs(PromptInput, { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsx(
          PromptInputTextarea,
          {
            ref: textareaRef,
            value: input,
            onChange: (e) => setInput(e.target.value),
            placeholder: "Ask StudentOS to move your academic success score forward — from roadmap to resume, study plan to exam readiness…",
            disabled: busy
          }
        ),
        /* @__PURE__ */ jsx(PromptInputFooter, { className: "justify-end", children: /* @__PURE__ */ jsx(PromptInputSubmit, { status, disabled: !input.trim() || busy }) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[11px] text-muted-foreground", children: "StudentOS focuses on academic & career topics. Powered by Lovable AI." })
    ] })
  ] });
}
function ThreadPage() {
  const {
    threadId
  } = useParams({
    from: "/_authenticated/app/$threadId"
  });
  const fetchMessages = useServerFn(getThreadMessages);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchMessages({
      data: {
        threadId
      }
    })
  });
  const initialMessages = (data?.messages ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts ?? []
  }));
  return /* @__PURE__ */ jsx(ChatLayout, { activeThreadId: threadId, children: isLoading ? /* @__PURE__ */ jsx("div", { className: "grid h-full place-items-center text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsx(ChatWindow, { threadId, initialMessages }, threadId) });
}
export {
  ThreadPage as component
};
