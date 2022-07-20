export interface ElementInterface {
  index: number;
  html: string;
  anchor: AnchorInterface;
  distance: number;
  wordMatch: number;
  urlMatch: number;
  positiveWords: number;
  blacklisted: boolean;
  whitelisted: boolean;
  points: PointInterface;
}

export interface AnchorInterface {
  attributes: {
    href?: string;
  };
  text: string;
  evaluation: AnchorDef;
  href?: string;
  wordingCheck(words: string[]): number;
  listedCheck(black: string[], white: string[]): [boolean, boolean];
  createHref(link: string): string | null;
}

export interface PointInterface {
  [key: string]: any
}

export interface AnchorDef {
  isBlank?: boolean;
  href?: string;
  isJavascriptBase?: boolean;
  isInnerLink?: boolean;
  isInPageLink?: boolean;
  hasNoHref?: boolean;
  isSponsored?: boolean;
  hasNoFollow?: boolean;
  hasGoogleAnalytics?: boolean;
}

export interface AnchorEvent {
  uuid: string;
  searchId: number;
  snapshotId: number;
  sites: Site[];
  data: Data;
}

export interface Site {
  id: number;
  link: string;
}

export interface Data {
  searchWords: string[];
  urlWords: string[];
  blacklists: string[];
  whitelists: string[];
  positiveWords: string[];
}
