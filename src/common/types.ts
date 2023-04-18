export type TransportTest = { filePath: string; title?: string; tags?: Mocha.GrepTag[] };

export type ParsedSpecs = {
  grep: string;
  total: number;
  tests: TransportTest[];
};
