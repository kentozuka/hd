import { SNSEvent } from 'aws-lambda';
import { failed, succeed } from './src/context';
import { divide, level, log, preferences, sleep } from './src/helper';
import { validateEvent } from './src/validate';
// import { URL } from 'url';

import * as puppeteer from 'puppeteer';

import data from './data'

let UUID = null
let stream = ''
let intentional = false

export const getStream = () => stream

const {
  softLimit,
  len,
  max
} = preferences

const main = async (event: SNSEvent) => {
  process.on('exit', () => {
    log(level.panic, `###STREAM:${stream}`)
  })
  divide()

  if (!event) return await failed(UUID, 'GOT NO EVENT')
  
  try {
    const message = event.Records[0].Sns.Message;
    if (!message) return await failed(UUID, 'GOT NO MESSAGE')

    const ed = validateEvent(message)
    if (!ed) await failed(UUID, 'FAILED TO PARSE MESSAGE')

    const {
      uuid,
      candidates,
      snapshotId,
      // blacklists,
      targets
    } = ed
    UUID = uuid

    const start = process.hrtime()

    // const targetOrigins = targets.map(x => new URL(x.href).origin)
    const allCandidates = candidates.flat()
    const siteIdsFound = []
    let open = true
    // let current = null

    const done = {}
    const idMatched = []
    
    const browser = await puppeteer.launch({
      headless: false
    })
    // pptr sometimes crashes
    browser.on('disconnect', async () => {
      if (intentional) return
      log(level.panic, 'Could be memory leak!')
      await failed(UUID, 'Browser disconnected!!')
    })
    const page = await browser.newPage()

    // page.on('request', async req => {
    //   try {
    //     if (req.resourceType() === 'document') {
    //       const url = new URL(req.url())
    //       if (!blacklists.includes(url.origin)) {
    //         done[current.id] = done[current.id] || { chain: [] }
    //         done[current.id].chain = done[current.id].chain.concat(url.href)
  
    //         if (targetOrigins.includes(url.origin)) {
    //           log(level.info, `Match: ${url.origin}`)
    //           siteIdsFound.push(current.siteId)
    //           idMatched.push(`${current.id}`)
    //           done[current.id].targetIndex = targetOrigins.indexOf(url.origin)
    //           open = false
    //         }
    //       }
    //     }
    //   } catch (e) {
    //     log(level.expected, null, e)
    //   }
    // })

    for (const chunk of candidates) {
      log(level.info, 'New Chunk = = = = = = = = =')
      for (const item of chunk) {
        // timeout
        const lp = process.hrtime(start)
        if (lp[0] >= softLimit) break

        // if not found yet
        if (!siteIdsFound.includes(item.siteId)) {
          log(level.info, `Site: ${item.siteId}, Id: ${item.id}`)
          // current = item
          // console.log(current)

          try {
            open = true
            await page.goto(item.href, { waitUntil: 'domcontentloaded' })

            let cnt = 0
            const set = new Set()
            await new Promise<void>(async (resolve) => {
              while (cnt < max) {
                if (!open) resolve()

                set.add(page.url())
                await sleep(len)
                cnt += len
              }
              resolve()
            })
            console.log(set)
          } catch (e) {
            log(level.panic, null, e)
          }
        }
      }
    }


    const filtered = Object.keys(done)
      .filter(key => idMatched.includes(key))
      .reduce((obj, key) => {
        obj[key] = done[key]
        return obj
      }, {})

    const resolved = Object.entries(filtered).map(([id, obj]: any) => ({
      targetId: targets[obj.targetIndex].id,
      snapshotId,
      siteId: allCandidates.find(x => `${x.id}` === id).siteId,
      chain: obj.chain,
      candidateId: +id
    }))

    intentional = true
    await browser.close()

    await succeed(UUID, resolved)
  } catch (e) {
    await failed(UUID, null, e)
  }
}

main(data)
