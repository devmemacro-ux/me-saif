import { Gamepad2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass border-t border-border mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted">
          <Gamepad2 className="w-5 h-5" />
          <span>© 2026 Fayez STORE</span>
        </div>
        <div className="text-text-muted text-sm">PUBG UC Store</div>
      </div>
    </footer>
  )
}
