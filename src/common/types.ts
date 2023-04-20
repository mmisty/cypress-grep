export interface GrepTagObject {
  tag: string;
  info?: string[];
}

export type GrepTagSimple = string;
export type GrepTag = GrepTagObject | GrepTagSimple;

export type TransportTest = { filePath: string; title?: string; tags?: GrepTag[] };

export type ParsedSpecs = {
  parentFolder?: string;
  filtered: number;
  grep: string;
  total: number;
  tests: TransportTest[];
};
