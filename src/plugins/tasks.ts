import { writeFileSync } from 'fs';
import type { ParsedSpecs } from '../common/types';

/**
 * Write file with contents (file path predefined)
 * @param parentFolder - folder relatively to which test ran in prefilter mode
 * @param filteredSpecs - path to file (set in plugins)
 */
export const taskWrite = (parentFolder: string, filteredSpecs: string) => ({
  writeTempFileWithSelectedTests: (contents: ParsedSpecs) => {
    const result = { parentFolder, ...contents };
    writeFileSync(filteredSpecs, JSON.stringify(result, null, '  '));

    return null;
  },
});
