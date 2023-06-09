import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';
import { pkgName } from '../common/logs';

const parentSuite = (tests: string) => {
  return `describe('', () => {
    let error = [];
${tests}

    if(error.length > 0) {
        throw new Error('${pkgName} Prefiltering failed as some of your test files crashed outside of test:\\n     ' + error.map((t,i)=>(i + 1) + ') ' + t.message).join('\\n\\n     '));
    }
});
`;
};

const testCode = (relativePath: string): string => {
  return `  describe(\`\$\{__dirname\}${relativePath.replace(/\/\/+/g, '/')}\`, () => {
    try {
      require('.${relativePath}');
    } catch(e){
      e.message = \`${pkgName} Prefiltering cannot be done for \\'\$\{__dirname\}${relativePath}\\', error when executing file: \\n      > \$\{e.message\}\`;
      error.push(e);
    }
  });`;
};

const testAutoGreneratedCode = (): string => {
  return `it('auto generated test when no GREP set', () => {
      // ignore
  });`;
};

/**
 * Will create file with all tests imported with require
 * @param outFilePath
 * @param testsDir - directory where file will be created, should be in tests
 * @param specPattern
 */
export const createAllTestsFile = (outFilePath: string, testsDir: string, specPattern: string | string[]): string => {
  const code = glob
    .sync(specPattern)
    .map(r => {
      // for 'require' to correctly resole need relative path (relative to path of created file outFilePath)
      const relative = r.slice(r.indexOf(testsDir) + testsDir.length);
      const pathMatch = new RegExp(path.basename(outFilePath).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'));

      if (!pathMatch.test(relative)) {
        return testCode(relative);
      }

      return undefined;
    })
    .filter(t => t);

  fs.writeFileSync(outFilePath, parentSuite(code.join('\n\n')));

  // eslint-disable-next-line no-console
  console.log(`${pkgName} Created file with all tests '${outFilePath}'`);

  return outFilePath;
};

export const createOneTestsFile = (outFilePath: string): string => {
  fs.writeFileSync(outFilePath, parentSuite(testAutoGreneratedCode()));

  // eslint-disable-next-line no-console
  console.log(`${pkgName} Created file with one test '${outFilePath}'`);

  return outFilePath;
};
