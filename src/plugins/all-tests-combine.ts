import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';

const parentSuite = (tests: string) => {
  return `describe('', () => {
${tests}
});
`;
};

const testCode = (relativePath: string) => {
  return `  describe(\`\$\{__dirname\}${relativePath.replace(/\/\/+/g, '/')}\`, () => {
    require('.${relativePath}');
  });`;
};

//.replace(/.[tj]s$/, '')
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
  console.log(`Created file with all tests '${outFilePath}'`);

  return outFilePath;
};
