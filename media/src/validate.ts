import { log } from "console"
import { level } from "./helper"

function validate<T>(x: T, type: string): boolean {
  if (!x) return true
  if (typeof x !== type) return true
  return false
}

export function validateEvent(str: string): MediaEvent | null {
  try {
    const d: MediaEvent = JSON.parse(str)
    const undefined: string[] = []

    if (validate(d.uuid, 'string')) undefined.push('uuid')
    if (!(d.origins || Array.isArray(d.origins))) undefined.push('origins')

    if (undefined.length) {
      const t = `Incorrect argument${undefined.length > 1 ? 's' : ''} => ${undefined.join(', ')}`
      log(level.expected, t)
      return null
    }

    return d
  } catch (e) {
    log(level.panic, null, e)
    return null
  }
}
