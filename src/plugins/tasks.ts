import { writeFileSync } from 'fs';
import type { ParsedSpecs } from '../common/types';
import { pkgName } from '../common/logs';

/**
 * Write file with contents (file path predefined)
 * @param parentFolder - folder relatively to which test ran in prefilter mode
 * @param filteredSpecs - path to file (set in plugins)
 */
export const taskWrite = (parentFolder: string, filteredSpecs: string) => ({
  writeTempFileWithSelectedTests: (contents: ParsedSpecs) => {
    const result = { parentFolder, ...contents };
    writeFileSync(filteredSpecs, JSON.stringify(result, null, '  '));

    console.log(`${pkgName} written file '${filteredSpecs}'`);

    return null;
  },
});
