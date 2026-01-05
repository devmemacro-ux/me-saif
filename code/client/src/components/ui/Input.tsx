import { InputHTMLAttributes, forwardRef } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, icon, className = '', ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm text-text-secondary font-medium">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent focus:glow-border text-text-primary placeholder-text-muted transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-status-error' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-status-error">{error}</p>}
  </div>
))

export default Input
