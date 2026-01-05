const API = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API + url, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const data = await res.json()
  if (!res.ok) {
    if (data.banned) {
      window.dispatchEvent(new CustomEvent('user-banned', { detail: { reason: data.reason } }))
    }
    throw new Error(data.error || 'Request failed')
  }
  return data
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body?: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' })
}
