import { db } from '../index.js'

export const settingsRepo = {
  get(key: string): string | null {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
    return row?.value || null
  },
  set(key: string, value: string) {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
  },
  delete(key: string) {
    db.prepare('DELETE FROM settings WHERE key = ?').run(key)
  }
}
