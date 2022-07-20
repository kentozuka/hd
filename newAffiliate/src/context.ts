import { log, level } from './helper'
import { writeFile } from 'fs'

export async function succeed(uuid: string, data) {
  if (!uuid || typeof uuid !== 'string') return failed(uuid, 'GOT NO UUID')

  log(level.info, 'Execution completed')
  try {
    writeFile('../result.txt', JSON.stringify(data), (e) => {
      if (e) console.log(e.message)
    })
  } catch (e) {
    failed(uuid, null, e)
  }
}

export async function failed(uuid: string, reason: string | null, e: Error | null = null) {
  if (reason) log(level.expected, reason)
  else if (e) log(level.panic, null, e)
  console.log('###FAILURE###')
  if (!uuid) log(level.info, 'Process failed with no response!!!')
  process.exit()
}
