import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';
import { parseAllure } from 'allure-js-parser';

export const deleteResults = () => {
  if (existsSync('allure-results')) {
    rmSync('allure-results', { recursive: true });
  }

  if (existsSync('reports/tests')) {
    rmSync('reports/tests', { recursive: true });
  }

  if (existsSync('reports/tests1')) {
    rmSync('reports/tests1', { recursive: true });
  }
};

export const runTests = (specPattern: string, args: string[] = []) => {
  execSync(
    `cd ${process.cwd()} &&
    node ./.bin/cy-grep.js --script 'COVERAGE_REPORT_DIR=reports/coverage-cypress CYPRESS_COVERAGE=true npm run cy:run -- --config ${specPattern}' ${args.join(
      ' ',
    )}`,
    {
      stdio: 'inherit',
    },
  );
};

export const createTests = (suite: string, titles: string[], file: string) => {
  if (!existsSync(`${process.cwd()}/${dirname(file)}`)) {
    mkdirSync(dirname(`${process.cwd()}/${file}`), { recursive: true });
  }

  const tests = titles
    .map(
      t => `it('${t}', () => {
    cy.log('test');
    })\n`,
    )
    .join('\n');

  writeFileSync(file, `describe("${suite}", () => {\n${tests}\n})`);
};

export const createTestsTagsObj = (
  suite: string,
  suiteTags: any,
  testsNew: { title: string; tags?: any }[],
  file: string,
) => {
  if (!existsSync(`${process.cwd()}/${dirname(file)}`)) {
    mkdirSync(dirname(`${process.cwd()}/${file}`), { recursive: true });
  }

  const tests = testsNew
    .map(
      t => `it('${t.title}', { tags: ${t.tags ? JSON.stringify(t.tags) : 'undefined'} }, () => {
    cy.log('test');
    })\n`,
    )
    .join('\n');

  writeFileSync(
    file,
    `describe("${suite}", { tags: ${suiteTags ? JSON.stringify(suiteTags) : 'undefined'} }, () => {\n${tests}\n})`,
  );
};

export const resSorted = () => {
  return parseAllure('allure-results')
    .map(t => ({ name: t.name, status: t.status }))
    .sort((a, b) => (a.name && b.name && a.name < b.name ? -1 : 1));
};
