import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, Props>(({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
  const base = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-bg-primary glow-border hover:glow',
    secondary: 'bg-bg-tertiary hover:bg-border text-text-primary border border-border',
    ghost: 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' }

  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
})

export default Button
