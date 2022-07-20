import { SNSHandler } from 'aws-lambda';
import axios from 'axios';
import 'source-map-support/register';
import { failed, succeed } from './src/context';
import { divide, getTime, level, log } from './src/helper';
import * as cheerio from 'cheerio'
import { URL } from 'url'
import { validateEvent } from './src/validate';

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

  if (!event) return await failed(UUID, 'GOT NO EVENT')

  try {
    const message = event.Records[0].Sns.Message;
    if (!message) return await failed(UUID, 'GOT NO MESSAGE')

    const data = validateEvent(message)
    if (!data) await failed(UUID, 'FAILED TO PARSE MESSAGE')

    const { uuid, origins } = data
    UUID = uuid

    const holder: MediaResult[] = []
    for (const origin of origins) {
      try {
        log(level.info, `Target: ${origin}`)
        const { data } = await axios.get(origin, { timeout: 10000 })
        const $ = cheerio.load(data)
        const title = $('title').text()
        const thum = $('meta[property="og:image"]').attr('content')
        const thumbnail = thum || $('meta[name="twitter:image"]').attr('content')

        const url = new URL(origin)
        const protocol = url.protocol
        const host = url.host

        holder.push({
          title,
          protocol,
          host,
          origin,
          thumbnail,
          created: getTime()
        })
      } catch (e) {
        log(level.expected, e.message)
      }
    }

    await succeed(UUID, holder)
  } catch (e) {
    await failed(UUID, null, e)
  }
}