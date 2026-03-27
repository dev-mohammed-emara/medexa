"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "../../utils/cn"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import ScrollLockWrapper from "./ScrollLockWrapper"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-0", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      dir="rtl"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input-background h-12 px-4 transition-all outline-none select-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap">
        {children}
      </div>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-5 text-muted-foreground shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  smallZ = false,
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & { smallZ?: boolean }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        dir="rtl"
        className={cn(
          "relative max-h-96 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-border overscroll-contain",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-98 data-[state=closed]:zoom-out-98 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-top-2 duration-250",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          smallZ ? "z-10" : "z-110",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectPrimitive.Viewport
          data-position={position}
          data-lenis-prevent
          className={cn(
            "p-0 overflow-y-auto touch-pan-y scroll-smooth scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
          )}
        >
           <ScrollLockWrapper>
             {children}
           </ScrollLockWrapper>
         </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex  w-full cursor-pointer items-center justify-between rounded-none py-2.5 px-3 text-sm outline-none select-none focus:bg-secondary focus:text-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-disabled:pointer-events-none data-disabled:opacity-50 transition-colors",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex items-center justify-center">
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}


export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
