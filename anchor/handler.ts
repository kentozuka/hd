import { SNSHandler } from 'aws-lambda';
import 'source-map-support/register';
import axios from 'axios'
import * as cheerio from 'cheerio'
import { validateEvent, validateData } from './src/validate';
import { divide, level, locations, log } from './src/helper';
import { failed, succeed } from './src/context';
import Element from './src/classes/Element';

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

    const ed = validateEvent(message)
    if (!ed) await failed(UUID, 'FAILED TO PARSE MESSAGE')

    const {
      uuid,
      searchId,
      snapshotId,
      sites,
      data
    } = ed
    UUID = uuid

    const d = validateData(data)
    if (!d) await failed(UUID, 'FAILED TO LOAD DATA')

    const {
      searchWords,
      urlWords,
      blacklists,
      whitelists,
      positiveWords
    } = d

    let result = []
    for (const site of sites) {
      try {
        const url = site.link
        log(level.info, `Target: ${url}`)
        const { data } = await axios.get(url, { timeout: 15000 })
        const $ = cheerio.load(data)
        const doc = $.html()

        const indices = searchWords.map(x => locations(x, doc)).flat()

        if (indices.length) {
          const anchors = []
          $('a').each((ix, el) => {
            const atom = new Element($, el, ix)
            atom.calculateDistance(doc, indices)
            atom.textMatching(searchWords, urlWords)
            atom.wordingCheck(positiveWords)
            atom.listedCheck(blacklists, whitelists)
            anchors.push(atom)
          })

          const distances = anchors.map(x => x.distance).sort((a, b) => a - b)
          const distancePoint = 100 / distances.length
          anchors.forEach(a => {
            a.setDistanceRank(distances, distancePoint)
            a.rate()
          })

          anchors.sort((a, b) => a.total - b.total).reverse()

          const softLimit = 6
          const pageWordMatch = indices.length
          const upperLimit = pageWordMatch > softLimit ? softLimit : pageWordMatch
          const eligible = anchors.slice(0, upperLimit)

          const f = eligible.map((x, ix) => x.asCandidate(searchId, snapshotId, site.id, ix, url))
          result = result.concat(f)
        } else {
          log(level.info, `No word match ${site.link}`)
        }
      } catch (e) {
        log(level.expected, null, e)
      }
    }

    await succeed(UUID, result)
  } catch (e) {
    await failed(UUID, null, e)
  }
}

