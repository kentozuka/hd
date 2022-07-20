export interface AffiliateEvent {
  uuid: string;
  candidates: Candidate[][];
  snapshotId: number;
  blacklists: string[];
  targets: Target[];
}

export interface Candidate {
  id: number;
  href: string;
  siteId: number;
  snapshotId: number;
  point: number;
}

export interface Target {
  id: number;
  href: string;
}

