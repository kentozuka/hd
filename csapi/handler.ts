import { SNSHandler } from 'aws-lambda';
import { validateEvent } from './src/validate';
import { succeed, failed, append } from './src/context';
import { search } from './src/search'
import { CsapiResult, Result } from './src/types';
import { lap, getTime, log, level, divide } from './src/helper'
import 'source-map-support/register';
import { URL } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { url } from 'inspector';

let UUID = null
let stream = ''

export const getStream = () => stream

export const main: SNSHandler = async (event, context, callback) => {
  process.on('exit', () => {
    log(level.panic, `###STREAM:${stream}`)
    callback(Error('exti'), null)
  })
  divide()

  stream = context.logStreamName
  if (!event) await failed(UUID, 'GOT NO EVENT')

  try {
    const message = event.Records[0].Sns.Message;
    if (!message) return await failed(UUID, 'GOT NO MESSAGE')

    const data = validateEvent(message)
    if (!data) await failed(UUID, 'FAILED TO PARSE MESSAGE')
    const { phraseId, content, snapshotId, depth, uuid } = data
    UUID = uuid

    log(level.info, `###UUID: ${UUID}`)

    for (let i = 0; i < depth; i++) {
      const ii = i * 10
      const items = await search(content, i === 0 ? 0 : ii + 1)
      if (items && items.length) {
        const formatted = items.map((x: CsapiResult, ix) => {
          x.rank = ii + (ix + 1) // ix is zero based index
          return x
        })

        const results: Result[] = []
        let i = 0
        for (const item of formatted) {
          const def = {
            origin: '',
            body: '',
            status: 600,
            time: 0
          }

          if (!item.link.endsWith('.pdf')) {
            try {
              const url = new URL(item.link)
              log(level.info, `Target: ${url.href}`)
              def.origin = url.origin

              lap()
              const { data, status: resStatus } = await axios.get(item.link, { timeout: 10000 }) // 10 second timeout
              const $ = cheerio.load(data)
              def.body = $('body').text().replace(/\s/g, '')
              def.status = resStatus
              def.time = Math.round(lap())
              log(level.info, `successful: ${i}`)
            } catch (e) {
              log(level.info, `failed: ${i}`)
              log(level.expected, e.message)
              def.body = e.message
              def.status = e.response ? e.response.status : 600
            }

            results.push({
              ...item,
              ...def,
              phraseId,
              snapshotId,
              created: getTime()
            })

            i++
          }
        }

        log(level.info, 'will continue')

        await append(UUID, results)
      } else {
        log(level.expected, `Avoided: Items not found at index ${i}, ii of ${ii}`)
      }
    }

    await succeed(UUID, stream)
  } catch (e) {
    await failed(UUID, null, e)
  }
}
