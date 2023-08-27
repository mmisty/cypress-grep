#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, rmSync, readFileSync } = require('fs');
const yargs = require('yargs');
const packagename = '[cypress-grep]';
const fileSpecPatternOriginal = 'spec_pattern.json';

const argv = yargs(process.argv.slice(2))
  .options({
    script: {
      type: 'string',
      demandOption: true,
      describe: `npm script to run`,
      alias: 's',
    },
    grep: {
      type: 'string',
      demandOption: false,
      describe: `grep - tags or test title (see docs https://www.npmjs.com/package/@mmisty/cypress-grep)`,
      alias: 'g',
    },
    'prefilter-file': {
      type: 'string',
      demandOption: true,
      default: './filtered_tests.json',
      describe: `file where prefiltered results will be stored`,
      alias: 'p',
    },
    'only-prefilter': {
      type: 'boolean',
      default: false,
      describe: `only prefilter, no run - will prefilter tests and create file with results`,
      alias: 'f',
    },
    'only-run': {
      type: 'boolean',
      default: false,
      describe: `will run prefiltered tests from file specified by --prefilter-file or --p option `,
      alias: 'r',
    },
    'delete-prefiltered': {
      type: 'boolean',
      default: true,
      describe: `grep`,
      alias: 'd',
    },
    'show-excluded-tests': {
      // sets GREP_showExcludedTests
      type: 'boolean',
      default: true,
      describe: `show excluded tests as skipped or not show them at all`,
      alias: 'se',
    },
    'show-tags-title': {
      // sets GREP_showTagsInTitle
      type: 'boolean',
      default: false,
      describe: `show tags in title`,
      alias: 'st',
    },
  })
  .help('help')
  .parseSync();

const { script, grep, prefilterFile, deletePrefiltered, onlyPrefilter, onlyRun, showExcludedTests, showTagsTitle } =
  argv;

const getGrepEnvVariableStr = grepInput => {
  if (grepInput) {
    return `CYPRESS_GREP='${grepInput}'`;
  }
  return '';
};
/**
 * Get original spec pattern
 * @return {undefined|string|string[]}
 */
const getSpecPattern = file => {
  const getRes = () => {
    if (existsSync(file)) {
      try {
        return JSON.parse(readFileSync(file).toString()).specPattern;
      } catch (e) {
        // ignore
      }
    }
    return undefined;
  };

  const res = getRes();

  try {
    if (existsSync(fileSpecPatternOriginal)) {
      rmSync(fileSpecPatternOriginal);
    }
  } catch (e) {
    // ignore
  }

  return res;
};

/**
 * Get spec pattern env variable
 */
const getSpecPatternVar = (origSpecPattern, grepInput, onlyRunInput) => {
  if (origSpecPattern && !grepInput) {
    // when no grep need to run original spec pattern
    return `CYPRESS_SPEC_PATTERN="[${origSpecPattern}]"`;
  }

  if (origSpecPattern && onlyRunInput) {
    return `CYPRESS_SPEC_PATTERN="[${origSpecPattern}]"`;
  }

  return `CYPRESS_SPEC_PATTERN="[]"`;
};

const execute = (vars, scriptInput) => {
  const args = `${vars.join(' ')} ${scriptInput}`;
  console.log(packagename + ' execute: "' + args + '"');
  execSync(`${vars.filter(t => t !== '').join(' ')} ${scriptInput}`, { stdio: 'inherit' });
};

try {
  const started = Date.now();
  let grepExpression = getGrepEnvVariableStr(grep);
  const resultsFileEnvVariableStr = `CYPRESS_GREP_RESULTS_FILE='${prefilterFile}'`;
  const execVars = [grepExpression, resultsFileEnvVariableStr];

  if (onlyRun && !existsSync(prefilterFile)) {
    console.log(
      `${packagename} Cannot run prefiltered since file ${prefilterFile} doesnt exist\n` +
        `${packagename}     Prefilter tests first by adding --f (or removing --r) options`,
    );
    throw new Error('Cannot run prefiltered');
  }

  if (!onlyRun) {
    console.log(`${packagename}: PRE-FILTERING MODE ${onlyPrefilter ? 'only prefilter' : ''}=== `);
    execute([...execVars, 'CYPRESS_GREP_PRE_FILTER=true'], script);
    const prefilteringDuration = `${(Date.now() - started) / 1000}s`;
    if (onlyPrefilter) {
      console.log(
        `${packagename}: FINISHED pre-filtering only (in ${prefilteringDuration}), results in ${prefilterFile}, to run execute with --r option === `,
      );
      process.exit(0);
    } else {
      console.log(`${packagename}: pre-filtering done in ${prefilteringDuration}`);
    }
  }

  console.log(`${packagename}: running tests === `);

  let specPattern = getSpecPattern(fileSpecPatternOriginal);
  let specString = getSpecPatternVar(specPattern, grep, onlyRun);

  execute(
    [
      ...execVars,
      'CYPRESS_GREP_PRE_FILTER=false',
      specString,
      `CYPRESS_GREP_showExcludedTests=${showExcludedTests === true}`,
      `CYPRESS_GREP_showTagsInTitle=${showTagsTitle === true}`,
    ],
    script,
  );

  if (!onlyRun && deletePrefiltered && existsSync(prefilterFile)) {
    rmSync(prefilterFile);
  }

  console.log(`${packagename}: FINISHED === `);
} catch (err) {
  console.log(`${packagename}: FINISHED (exit code: 1) === ` + err.message);
  console.log(err);
  process.exit(1);
}