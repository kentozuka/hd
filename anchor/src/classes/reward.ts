export default {
  hasNoHref: {
    type: 'single',
    point: -100
  },
  isBlank: {
    type: 'single',
    point: 40
  },
  isJavascriptBase: {
    type: 'single',
    point: -40
  },
  isInnerLink: { // starts with #
    type: 'single',
    point: -100
  },
  isInPageLink: {
    type: 'single',
    point: -10,
  },
  isSponsored: {
    type: 'single',
    point: 30
  },
  hasNoFollow: {
    type: 'single',
    point: 20
  },
  hasGoogleAnalytics: {
    type: 'single',
    point: 50
  },
  wordMatch: {
    type: 'single',
    point: 40
  },
  urlMatch: {
    type: 'single',
    point: 50
  },
  positiveWords: {
    type: 'single',
    point: 60
  },
  blacklisted: {
    type: 'single',
    point: -130
  },
  whitelisted: {
    type: 'single',
    point: 130
  }
}