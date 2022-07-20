import axios from 'axios'
import { getStream } from '../handler'
import { log, level, env } from './helper'
import { Result } from './types'

const base = env.API_BASE

export async function append(uuid: string, data: Result[]) {
  if (!uuid || typeof uuid !== 'string') return await failed(uuid, 'GOT NO UUID')

  try {
    const edp = env.API_APPEND
    const { data: res } = await axios.post(base + edp, { uuid, data })
    log(level.info, `Payload sent to ${base}!`)
    log(level.info, JSON.stringify(res))
  } catch (e) {
    await failed(uuid, null, e)
  }
}

export async function succeed(uuid: string, stream: string) {
  if (!uuid || typeof uuid !== 'string') return await failed(uuid, 'GOT NO UUID')

  try {
    const edp = env.API_ENDPOINT
    const { data: res } = await axios.post(base + edp, { uuid, stream })
    log(level.info, `Payload sent to ${base}!`)
    log(level.info, JSON.stringify(res))
    log(level.info, 'Execution completed')
  } catch (e) {
    await failed(uuid, null, e)
  }
}

export async function failed(uuid: string, reason: string | null, e: Error | null = null) {
  if (reason) log(level.expected, reason)
  else if (e) log(level.panic, null, e)
  console.log('###FAILURE###')
  const edp = env.API_ENDPOINT_FAILURE
  if (uuid) await axios.post(base + edp, { uuid, stream: getStream(), error: e.message })
  else log(level.info, 'Process failed with no response!!!')
  process.exit()
}
