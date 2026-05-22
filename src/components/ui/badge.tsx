import React from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'green' | 'red' | 'blue' | 'yellow'
  children: React.ReactNode
}

const variantStyles = {
  purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  red: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  yellow: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
}

export const Badge = ({
  variant = 'blue',
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center font-medium justify-center rounded-xl! border px-2 py-0.5 text-xs  w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
