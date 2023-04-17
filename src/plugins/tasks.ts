import { writeFileSync } from 'fs';

/**
 * Write file with contents (file path predefined)
 * @param filteredSpecs - path to file (set in plugins)
 */
export const taskWrite = (filteredSpecs: string) => ({
  writeTempFileWithSelectedTests: (contents: string) => {
    writeFileSync(filteredSpecs, contents);

    return null;
  },
});
