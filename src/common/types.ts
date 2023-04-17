export type TransportTest = { filePath: string; title?: string; tags?: string[] };

export type ParsedSpecs = {
  grep: string;
  tests: TransportTest[];
};
