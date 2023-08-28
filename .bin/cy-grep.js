#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, rmSync, readFileSync } = require('fs');
const yargs = require('yargs');
const packagename = '[cypress-grep]';
const fileSpecPatternOriginal = () => `temp_grep/spec_pattern.json`;

const argv = yargs(process.argv.slice(2))
  .options({
    script: {
      type: 'string',
      default: 'npx cypress run',
      demandOption: true,
      describe: `script that runs tests. ex. 'npm run cy:run' or 'npx cypress run'`,
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
      describe: `whether to delete pre-filtered results file or keep`,
      alias: 'd',
    },
    'show-excluded-tests': {
      // sets GREP_showExcludedTests
      type: 'boolean',
      default: undefined, // true,
      describe: `show excluded tests as skipped or not show them at all (for not showing --no-show-excluded-tests or --not-e)`,
      alias: 'e',
    },
    'show-tags-title': {
      // sets GREP_showTagsInTitle
      type: 'boolean',
      default: undefined, // false,
      describe: `show tags in test title`,
      alias: 't',
    },
  })
  .help('help')
  .parseSync();

const {
  script,
  grep: grepInput,
  prefilterFile: prefilterFileInput,
  deletePrefiltered,
  onlyPrefilter,
  onlyRun,
  showExcludedTests,
  showTagsTitle,
} = argv;

const getGrepEnvVariableStr = grepInputT => {
  if (grepInputT) {
    return `CYPRESS_GREP='${grepInputT}'`;
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
    if (existsSync(fileSpecPatternOriginal())) {
      rmSync(fileSpecPatternOriginal());
    }
  } catch (e) {
    // ignore
  }

  return res;
};

/**
 * Get spec pattern env variable
 */
const getSpecPatternVar = (origSpecPattern, grepInputT, onlyRunInput) => {
  if (origSpecPattern && !grepInputT) {
    // when no grep need to run original spec pattern
    return `CYPRESS_SPEC_PATTERN="[${origSpecPattern}]"`;
  }

  if (origSpecPattern && onlyRunInput) {
    return `CYPRESS_SPEC_PATTERN="[${origSpecPattern}]"`;
  }

  if (!grepInputT) {
    return '';
  }

  return `CYPRESS_SPEC_PATTERN="[]"`;
};

const execute = (vars, scriptInput) => {
  const args = [...vars, scriptInput].filter(t => t !== '').join(' ');
  console.log(packagename + ' execute: "' + args + '"');
  execSync(`${vars.filter(t => t !== '').join(' ')} ${scriptInput}`, { stdio: 'inherit', env: process.env });
};

try {
  let grep;
  if (!grepInput && process.env.CYPRESS_GREP) {
    grep = process.env.CYPRESS_GREP;
  } else {
    grep = grepInput;
  }
  
  const started = Date.now();
  let grepExpression = getGrepEnvVariableStr(grep);
 
  const random = 4000000 + Math.round(Math.random() * 1000000);
  const prefilterFile = prefilterFileInput ??  `./temp_grep/filtered_tests_${!onlyRun ? random : ''}.json`;

  let resultsFileEnvVariableStr = `CYPRESS_GREP_RESULTS_FILE='${prefilterFile}'`;
  
 /* process.on('signal', async (signal) => {
    console.log('signal: ', signal);
    if (signal === 'SIGINT') {
      try {
        console.log('SIGINT'  +random)
        if (existsSync(fileSpecPatternOriginal(random))) {
          rmSync(fileSpecPatternOriginal(random));
          console.log('DEL'  +random);
        }
      } catch (e) {
        // ignore
      }
      process.exit(0);
    }
  });*/

  if (onlyRun || !grep) {
    if (!existsSync(prefilterFile) && !grep) {
      console.log(
        `${packagename} Will run all tests: prefilter tests by adding \`--grep \` for faster filtering (for help \`cy-grep --help\`)`,
      );
      resultsFileEnvVariableStr = '';
    } else {
      if (existsSync(prefilterFile)) {
        // run all tests from prefiltered file or all
        console.log(`${packagename} Will run tests from ${prefilterFile}`);
      } else {
        resultsFileEnvVariableStr = '';
        console.log(
          `${packagename} Will run without pre-filtering tests since file ${prefilterFile} doesn't exist\n` +
            `${packagename} -> Prefilter tests for faster filtering first by adding --f (or removing --r) options`,
        );
      }
    }
  } else {
    console.log(`${packagename} PRE-FILTERING MODE ${onlyPrefilter ? 'only prefilter' : ''}=== `);
    execute([grepExpression, resultsFileEnvVariableStr, 'CYPRESS_GREP_PRE_FILTER=true', `CYPRESS_GREP_RANDOM=${random}`], script);
    const prefilteringDuration = `${(Date.now() - started) / 1000}s`;
    if (onlyPrefilter) {
      console.log(
        `${packagename} FINISHED pre-filtering only (in ${prefilteringDuration}), results in ${prefilterFile}, to run execute with --r option === `,
      );
      process.exit(0);
    } else {
      console.log(`${packagename} pre-filtering done in ${prefilteringDuration}`);
    }
  }

  console.log(`${packagename} Running tests === `);

  let specPattern = getSpecPattern(fileSpecPatternOriginal);
  let specString = getSpecPatternVar(specPattern, grep, onlyRun);

  // to use from cypress config when not set
  const exclTests =
    showExcludedTests !== undefined ? `CYPRESS_GREP_showExcludedTests=${showExcludedTests === true}` : '';
  const showTags = showTagsTitle !== undefined ? `CYPRESS_GREP_showTagsInTitle=${showTagsTitle === true}` : '';

  execute(
    [grepExpression, resultsFileEnvVariableStr, 'CYPRESS_GREP_PRE_FILTER=false', specString, exclTests, showTags],
    script,
  );

  if (!onlyRun && deletePrefiltered && existsSync(prefilterFile)) {
    rmSync(prefilterFile);
  }

  console.log(`${packagename} FINISHED === `);
  
 
} catch (err) {
  console.log(`${packagename} FINISHED (exit code: 1) === `);
  // console.log(err);
  process.exit(1);
}