/// <reference types="cypress" />
import { writeFileSync } from 'fs';
import type { ParsedSpecs } from '../common/types';
import { pkgName } from '../common/logs';
import { publicGet } from './public-config-plugin';

/**
 * Write file with contents (file path predefined)
 * @param config - plugin config options
 * @param parentFolder - folder relatively to which test ran in prefilter mode
 * @param filteredSpecsFile - path to file (set in plugins)
 */
export const taskWrite = (config: Cypress.PluginConfigOptions, parentFolder: string, filteredSpecsFile: string) => ({
  writeTempFileWithSelectedTests: (contents: ParsedSpecs) => {
    const result = { parentFolder, ...contents };
    writeFileSync(filteredSpecsFile, JSON.stringify(result, null, '  '));

    const cyan = '\x1b[36m';
    const end = '\x1b[0m';

    if (contents.tests.length > 0) {
      console.log(
        `${pkgName} filtered:\n  ${cyan}◌${end} ${contents.tests
          .map(t => `${cyan}${`${t.filteredTitle}`.replace(/\/\//g, '/')}${end}`)
          .join(`\n  ${cyan}◌${end} `)}\n`,
      );
    }

    console.log(
      `${pkgName} filtered ${contents.tests.length} from total ${contents.total} tests by spec pattern: ${publicGet(
        config,
        'originalSpecPattern',
      )}`,
    );
    console.log(`${pkgName} file with results written: '${filteredSpecsFile}'`);

    return null;
  },
});
