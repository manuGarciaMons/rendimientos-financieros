const PIN_KEY = 'rendimientos-pin'
const SALT = 'rendimientos-2026'

async function hashPin(pin) {
  const encoded = new TextEncoder().encode(pin + SALT)
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isPinSetup() {
  return Boolean(localStorage.getItem(PIN_KEY))
}

export async function setupPin(pin) {
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_KEY, hash)
}

export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return false
  const hash = await hashPin(pin)
  return hash === stored
}
