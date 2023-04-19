export type TransportTest = { filePath: string; title?: string; tags?: Mocha.GrepTag[] };

export type ParsedSpecs = {
  parentFolder?: string;
  filtered: number;
  grep: string;
  total: number;
  tests: TransportTest[];
};
