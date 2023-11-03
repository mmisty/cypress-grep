import { GrepTag } from '@mmisty/cypress-tags/common/types';

export type TransportTest = { filePath: string; title?: string; tags?: GrepTag[]; filteredTitle?: string };

export type ParsedSpecs = {
  parentFolder?: string;
  filtered: number;
  grep: string;
  total: number;
  tests: TransportTest[];
};
