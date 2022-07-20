import { log } from "console"
import { level } from "./helper"
import { AffiliateEvent } from "./types"

function validate<T>(x: T, type: string): boolean {
  if (!x) return true
  if (typeof x !== type) return true
  return false
}

function er(ar: string[]) {
  const t = `Incorrect argument${ar.length > 1 ? 's' : ''} => ${ar.join(', ')}`
  log(level.expected, t)
}

export function validateEvent(str: string): AffiliateEvent | null {
  try {
    const d: AffiliateEvent = JSON.parse(str)
    const undefined: string[] = []

    if (validate(d.uuid, 'string')) undefined.push('uuid')
    if (!d.candidates || !Array.isArray(d.candidates)) undefined.push('candidates')
    if (validate(d.snapshotId, 'number')) undefined.push('snapshotId')
    if (!d.blacklists || !Array.isArray(d.candidates)) undefined.push('blacklists')
    if (!d.targets || !Array.isArray(d.targets)) undefined.push('targets')

    if (undefined.length) {
      er(undefined)
      return null
    }

    return d
  } catch (e) {
    log(level.panic, null, e)
    return null
  }
}
