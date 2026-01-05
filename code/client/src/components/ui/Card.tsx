import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: boolean
}

export default function Card({ children, className = '', glow }: Props) {
  return (
    <div className={`glass rounded-xl p-6 ${glow ? 'glow-border' : ''} ${className}`}>
      {children}
    </div>
  )
}
