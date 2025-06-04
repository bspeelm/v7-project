import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
      destructive: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
      outline: 'border border-green-600 bg-transparent text-green-600 hover:bg-green-600 hover:text-white',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-transparent',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-transparent',
      link: 'bg-transparent text-green-600 underline-offset-4 hover:underline border-transparent',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }