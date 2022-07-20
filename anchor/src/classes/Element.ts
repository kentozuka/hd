import Anchor from './Anchor'
import { ElementInterface, AnchorInterface, PointInterface } from '../types'
import rewards from './reward'

export default class Element implements ElementInterface {
  index: number;
  html: string;
  anchor: AnchorInterface;
  points: PointInterface;
  distance: number;
  wordMatch: number;
  urlMatch: number;
  positiveWords: number;
  blacklisted: boolean;
  whitelisted: boolean;

  // cherry
  constructor(cherry: any, berry: any, index: number) {
    const data = cherry(berry)

    this.index = index
    this.html = cherry.html(berry)
    this.anchor = new Anchor(data)
    this.points = {}
  }

  get total(): number {
    const tmp = Object.values(this.points)
    return tmp.reduce((a, b) => a + b, 0)
  }

  get grade() {
    return {
      wordMatch: this.wordMatch,
      urlMatch: this.urlMatch,
      positiveWords: this.positiveWords,
      blacklisted: this.blacklisted,
      whitelisted: this.whitelisted,
      ...this.anchor.evaluation
    }
  }

  calculateDistance(html: string, indices: number[]) {
    const ix = html.indexOf(this.html)
    const d = shortestDistance(indices, ix)
    this.distance = d
  }

  textMatching(word: string[], url: string[]) {
    const words = new RegExp(word.join('|'), 'g')
    const urls = new RegExp(url.join('|'), 'g')

    const wordsMatch = this.html.match(words)
    const urlsMatch = this.html.match(urls)

    this.wordMatch = wordsMatch ? wordsMatch.length : 0
    this.urlMatch = urlsMatch ? urlsMatch.length : 0
  }

  wordingCheck(words: string[]) {
    this.positiveWords = this.anchor.wordingCheck(words)
  }

  listedCheck(black: string[], white: string[]) {
    const [bk, wh] = this.anchor.listedCheck(black, white)
    this.blacklisted = bk
    this.whitelisted = wh
  }

  setDistanceRank(whole: number[], unit: number) {
    const ix = whole.indexOf(this.distance)
    const rank = whole.length - ix
    this.points.distance = Math.floor(rank * unit)
  }

  rate() {
    for (const key in this.grade) {
      const g = this.grade[key]
      const r = rewards[key]
      const t = r.type

      let p
      if (t === 'single') {
        p = g ? r.point : 0
      } else if (t === 'multiple') {
        p = g * r.point
      }

      this.points[key] = p
    }
  }

  asCandidate(searchId: number, snapshotId: number, siteId: number, index: number, link: string) {
    const href = this.anchor.createHref(link)

    return {
      siteId,
      searchId,
      snapshotId,
      href,
      html: this.html,
      rank: index + 1,
      point: this.total,
      detail: this.points
    }
  }
}

function shortestDistance(data: number[], num: number): number {
  let min = num
  for (const el of data) {
    const dif = Math.abs(el - num)
    if (dif < min) min = dif
  }

  return min
}

