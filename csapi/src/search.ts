import { log, level, lap } from './helper'
import { google } from 'googleapis'
import { env } from './helper'
import { failed } from './context'
import { validateSearch } from './validate'

// parameters
const customSeach = google.customsearch('v1')
const cx = env.CUSTOM_SEARCH_ENGINE_ID
const auth = env.GOOGLE_API_KEY
const gl = 'jp'
const lr = 'lang_jp'
const timeout = 8000

export async function search(q: string, start: number) {
  const valid = validateSearch(cx, auth, q, start)
  if (valid) log(level.panic, 'LACKING PARAMS')

  let option = {
    cx,
    auth,
    q,
    ...(gl && { gl }), // if exist add
    ...(lr && { lr }),
    ...(start && { start }),
    timeout
  }


  lap()
  try {
    log(level.info, `TRYING WITH ${option.q} - ${option.start || 0}`)
    const { data } = await customSeach.cse.list(option)
    const total = data.searchInformation.formattedTotalResults
    const time = data.searchInformation.formattedSearchTime
    log(level.info, `${total} items in ${time}s`)
    const { items } = data
    return items
  } catch (e) {
    log(level.expected, `Took ${lap()}ms. Timeout set to ${timeout}ms`)
    process.exit()
  }
}
