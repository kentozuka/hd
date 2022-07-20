import { AnchorDef, AnchorInterface } from "../types";
import { URL } from 'url'
import { level, log } from "../helper";

export default class Anchor implements AnchorInterface {
  attributes: {
    href?: string;
  };
  text: string;
  evaluation: AnchorDef;
  href: string;

  constructor(data: any) { // too lazy to implement cheerio types
    this.attributes = data.get(0).attribs
    this.text = data.text().trim()
    this.evaluation = this.setup()
  }

  setup() {
    const ref = this.attributes
    const def: AnchorDef = {}

    def.isBlank = ref['target'] !== null
    const href = ref['href'] || null
    const rel = ref['rel'] || null

    if (href) {
      this.href = href
      const jsMatch = href.match(/javascript:.+\(+.\)/)

      def.isJavascriptBase = jsMatch !== null
      def.isInnerLink = href[0] === '#'
      def.isInPageLink = href[0] !== 'h' // does not start with https:// or http:// => in page link
    } else {
      def.hasNoHref = true
    }

    if (rel) {
      const relList = rel.split(' ')
      def.isSponsored = relList.includes('sponsored')
      def.hasNoFollow = relList.includes('nofollow')
    }

    if (ref['data-gtm']) {
      def.hasGoogleAnalytics = true
    }
    if (ref['onclick']) {
      const cn = ref['onclick'].match('dataLayer.push')
      if (cn) def.hasGoogleAnalytics = true
    }

    return def
  }

  wordingCheck(words: string[]): number {
    const rex = new RegExp(words.join('|'), 'g')
    const mtc = this.text.match(rex)
    return mtc ? mtc.length : 0
  }

  listedCheck(black: string[], white: string[]): [boolean, boolean] {
    if (!this.href) return [false, false]

    try {
      const { origin } = new URL(this.href)
      return [
        black.includes(origin),
        white.includes(origin)
      ]
    } catch {
      return [false, false]
    }
  }

  createHref(link: string): string | null {
    try {
      const base = new URL(link)
      const href = this.attributes.href
      const rex = new RegExp('^(?:(ht|f)tp(s?)\:\/\/)?')

      if (!href) return base.href
      if (href.match(rex)[0] !== '') return href
      if (href[0] === '#' || href[0] === '/') return base.origin + href

      return base.origin + '/' + href
    } catch (e) {
      log(level.expected, `Failed to URLify ${link}`)
      return null
    }
  }
}