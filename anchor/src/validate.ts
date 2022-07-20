import { log } from "console"
import { level } from "./helper"
import { AnchorEvent, Data } from "./types"

function validate<T>(x: T, type: string): boolean {
  if (!x) return true
  if (typeof x !== type) return true
  return false
}

function er(ar: string[]) {
  const t = `Incorrect argument${ar.length > 1 ? 's' : ''} => ${ar.join(', ')}`
  log(level.expected, t)
}

export function validateEvent(str: string): AnchorEvent | null {
  try {
    const d: AnchorEvent = JSON.parse(str)
    const undefined: string[] = []

    if (validate(d.uuid, 'string')) undefined.push('uuid')
    if (validate(d.searchId, 'number')) undefined.push('searchId')
    if (validate(d.snapshotId, 'number')) undefined.push('snapshotId')
    if (!d.sites || !Array.isArray(d.sites)) undefined.push('sites')
    if (!d.data) undefined.push('data')

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

export function validateData(d: Data): Data | null {
  try {
    const undefined: string[] = []

    if (!d.searchWords || !d.searchWords.length) undefined.push('searchWords')
    if (!d.urlWords || !d.urlWords.length) undefined.push('urlWords')
    if (!d.blacklists || !d.blacklists.length) undefined.push('blacklists')
    if (!d.whitelists || !d.whitelists.length) undefined.push('whitelists')
    if (!d.positiveWords || !d.positiveWords.length) undefined.push('positiveWords')

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
