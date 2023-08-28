import { writeFileSync } from 'fs';
import type { ParsedSpecs } from '../common/types';
import { pkgName } from '../common/logs';

/**
 * Write file with contents (file path predefined)
 * @param config - plugin config options
 * @param parentFolder - folder relatively to which test ran in prefilter mode
 * @param filteredSpecs - path to file (set in plugins)
 */
export const taskWrite = (
  config: { env: { [key: string]: unknown } },
  parentFolder: string,
  filteredSpecs: string,
) => ({
  writeTempFileWithSelectedTests: (contents: ParsedSpecs) => {
    const result = { parentFolder, ...contents };
    writeFileSync(filteredSpecs, JSON.stringify(result, null, '  '));

    const cyan = '\x1b[36m';
    const end = '\x1b[0m';
    console.log(
      `${pkgName} filtered:\n  ${cyan}◌${end} ${contents.tests
        .map(t => `${cyan}${`${t.filteredTitle}`.replace(/\/\//g, '/')}${end}`)
        .join(`\n  ${cyan}◌${end} `)}\n`,
    );
    console.log(
      `${pkgName} filtered ${contents.tests.length} from total ${contents.total} tests by spec pattern: ${config.env['originalSpecPattern']}`,
    );
    console.log(`${pkgName} file with results written: '${filteredSpecs}'`);

    return null;
  },
});
