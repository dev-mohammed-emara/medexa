import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface BtnPrimaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  isPending?: boolean
}

const BtnPrimary = ({ children, className, isPending, ...props }: BtnPrimaryProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground px-4 py-2 h-12 bg-primary hover:bg-primary/90 hover:shadow-primary/20",
        className
      )}
      {...props}
    >
      {isPending ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}

export default BtnPrimary
