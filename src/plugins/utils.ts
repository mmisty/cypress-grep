import glob from 'fast-glob';
import { pkgName } from '../common/logs';

export const compareStr = (pathSeparator: string, str1: string, str2: string): string => {
  const arr1 = str1.split(pathSeparator);
  const arr2 = str2.split(pathSeparator);
  const len = arr1.length > arr2.length ? arr2.length : arr1.length;
  const common: string[] = [];
  let index = 0;

  for (let i = 0; i < len; i++) {
    if (arr1[i] === arr2[i] && index === i) {
      index++;
      common.push(arr1[i]);
    }
  }

  return common.join('/');
};

export const commonPathPartList = (list: string[]): string => {
  const pathSeparator = '/';
  // max length
  let common = list.length > 0 ? list.reduce((p, c) => (p.length > c.length ? p : c)) : '';

  if (list.length > 1) {
    for (let i = 0; i < list.length - 1; i++) {
      const commCurrent = compareStr(pathSeparator, list[i], list[i + 1]);

      if (common.length >= commCurrent.length) {
        common = commCurrent;
      }
    }
  }

  const parts = common.split(pathSeparator);

  // when file
  if (list.length === 1 && parts[parts.length - 1].indexOf('.') !== -1) {
    return parts.slice(0, parts.length - 1).join(pathSeparator);
  }

  return common;
};

export const getRootFolder = (pattern: string | string[] | undefined, fallbackRoot: string): string => {
  // default cypress cypress/e2e/**/*.cy.{js,jsx,ts,tsx}
  try {
    if (!pattern) {
      throw new Error('Spec pattern not specified');
    }

    const list = glob.sync(pattern);

    if (list.length === 0) {
      throw new Error(`Not found tests by specPattern \`${pattern}\``);
    }

    return commonPathPartList(list);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`${pkgName} Could not get root tests folder: \n   ${err}`);

    return fallbackRoot;
  }
};
