import type { ClassValue } from 'clsx'
import type { Ref } from 'vue'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Small "updater" helper like TanStack, without the dependency */
export type Updater<T> = T | ((prev: T) => T)

export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>) {
  ref.value =
      typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: T) => T)(ref.value)
          : updaterOrValue
}

/** Cookie util with proper typing + SSR-safe */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const pattern = new RegExp(`(?:^|; )${escapeRegExp(name)}=([^;]*)`)
  const match = document.cookie.match(pattern)
  const value = match?.[1]
  return value !== undefined ? decodeURIComponent(value) : null
}
