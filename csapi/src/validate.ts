import { log } from "console"
import { level } from "./helper"
import { CsapiData } from "./types"

function validate<T>(x: T, type: string): boolean {
  if (!x) return true
  if (typeof x !== type) return true
  return false
}

export function validateEvent(str: string): CsapiData | null {
  try {
    const d: CsapiData = JSON.parse(str)
    const undefined: string[] = []

    if (validate(d.uuid, 'string')) undefined.push('uuid')
    if (validate(d.snapshotId, 'number')) undefined.push('snapshotId')
    if (validate(d.depth, 'number')) undefined.push('depth')
    if (validate(d.content, 'string')) undefined.push('content')
    if (validate(d.phraseId, 'number')) undefined.push('phraseId')

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

export function validateSearch(cx: string, auth: string, q: string, start: number): string[] | null {
  const unds: string[] = []

  if (validate(cx, 'string')) unds.push('cx')
  if (validate(auth, 'string')) unds.push('auth')
  if (validate(q, 'string')) unds.push('q')
  if (isNaN(start)) unds.push('start')

  if (unds.length) return unds

  return null
}
