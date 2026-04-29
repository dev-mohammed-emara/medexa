"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "../../utils/cn"
import { ChevronDownIcon, CheckIcon, Search } from "lucide-react"
import ScrollLockWrapper from "./ScrollLockWrapper"

const getElementText = (node: React.ReactNode): string => {
  if (node == null) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getElementText).join("")
  if (React.isValidElement(node)) return getElementText((node as React.ReactElement<any>).props.children)
  return ""
}

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
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input-background h-12 px-4 transition-all outline-none select-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start">
        {children}
      </div>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-5 text-muted-foreground shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

import { useLanguage } from "../../contexts/LanguageContext"

function SelectContent({
  smallZ = false,
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & { smallZ?: boolean }) {
  const { isAr } = useLanguage()
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const itemsCount = React.useMemo(() => {
    let count = 0
    const traverse = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (React.isValidElement(child)) {
          if ((child.props as any)["data-slot"] === "select-item") {
            count++
          } else if ((child.props as any).children) {
            traverse((child.props as any).children)
          }
        }
      })
    }
    traverse(children)
    return count
  }, [children])

  const showSearch = itemsCount > 10

  const filteredChildren = React.useMemo(() => {
    if (!search || !showSearch) return children

    const filter = (node: React.ReactNode): React.ReactNode => {
      return React.Children.map(node, (child) => {
        if (!React.isValidElement(child)) return child

        if ((child.props as any)["data-slot"] === "select-item") {
          const text = getElementText((child.props as any).children).toLowerCase()
          return text.includes(search.toLowerCase().trim()) ? child : null
        }

        if ((child.props as any).children) {
          const filtered = filter((child.props as any).children)
          if (React.Children.count(filtered) > 0) {
            return React.cloneElement(child as React.ReactElement<any>, {
              children: filtered,
            })
          }
          return null
        }

        return child
      })
    }
    return filter(children)
  }, [children, search, showSearch])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative max-h-96 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-border overscroll-contain",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-98 data-[state=closed]:zoom-out-98 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-top-2 duration-250",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          smallZ ? "z-10" : "z-1050",
          className
        )}
        position={position}
        align={align}
        // @ts-ignore
        onOpenAutoFocus={(e: any) => {
          if (showSearch) {
            e.preventDefault()
            inputRef.current?.focus()
          }
        }}
        onKeyDown={(e) => {
          if (showSearch && e.key === "ArrowUp") {
            const items = e.currentTarget.querySelectorAll('[data-slot="select-item"]')
            if (document.activeElement === items[0]) {
              e.preventDefault()
              inputRef.current?.focus()
            }
          }
        }}
        {...props}
      >
        {showSearch && (
          <div className="p-2 sticky top-0 bg-popover z-20 border-b border-border">
            <div className="relative flex items-center">
              <Search className={cn("absolute size-4 text-muted-foreground", isAr ? "right-3" : "left-3")} />
              <input
                ref={inputRef}
                dir={isAr ? "rtl" : "ltr"}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-border bg-input-background py-1 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50",
                  isAr ? "pr-9 pl-3" : "pl-9 pr-3"
                )}
                placeholder={isAr ? "بحث..." : "Search..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    const firstItem = e.currentTarget
                      .closest('[data-slot="select-content"]')
                      ?.querySelector('[data-slot="select-item"]') as HTMLElement
                    firstItem?.focus()
                  }
                  e.stopPropagation()
                }}
              />
            </div>
          </div>
        )}
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
            {filteredChildren}
            {showSearch && React.Children.count(filteredChildren) === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground font-bold">
                {isAr ? "لا توجد نتائج" : "No results found"}
              </div>
            )}
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
