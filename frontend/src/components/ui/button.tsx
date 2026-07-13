import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-[#0b4a3a] text-primary-foreground shadow-sm shadow-emerald-950/18 hover:-translate-y-0.5 hover:bg-[#12372c] hover:shadow-md hover:shadow-emerald-950/20 focus-visible:outline-primary',
        secondary:
          'border border-[#1b342b]/12 bg-white/78 text-foreground shadow-sm shadow-stone-900/5 backdrop-blur hover:-translate-y-0.5 hover:border-emerald-800/25 hover:bg-white focus-visible:outline-secondary',
        ghost:
          'text-muted hover:bg-white/70 hover:text-foreground focus-visible:outline-primary',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
