import { customsearch_v1 } from "googleapis";

export interface Context {
  e: Error | null;
  reason: string | null;
}

export interface CsapiData {
  uuid: string;
  snapshotId: number;
  depth: number;
  content: string;
  phraseId: number;
}

export interface CsapiResult extends customsearch_v1.Schema$Result {
  rank: number;
}

export interface Result extends CsapiResult {
  origin: string;
  body: string;
  status: number;
  time: number;
  phraseId: number;
  snapshotId: number;
  created: string;
}

