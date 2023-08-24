#!/usr/bin/env node
const { exec, execSync } = require('child_process');
const yargs = require('yargs');
const { existsSync, rmSync, readSync, readFileSync } = require('fs');

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
      describe: `grep`,
      alias: 'p',
    },
    'only-prefilter': {
      type: 'boolean',
      default: false,
      describe: `only prefilter, no run`,
      alias: 'f',
    },
    'only-run-prefiltered': {
      type: 'boolean',
      default: false,
      describe: `only run prefilter, no run`,
      alias: 'r',
    },
    'delete-prefilter': {
      type: 'boolean',
      default: true,
      describe: `grep`,
      alias: 'd',
    },
  })
  .help('help')
  .parseSync();

const { script, grep, prefilterFile, deletePrefilter, onlyPrefilter, onlyRunPrefiltered } = argv;

try {
  let grepExpression = ``;

  if (grep) {
    grepExpression = `CYPRESS_GREP='${grep}'`;
  }
  if(!onlyRunPrefiltered){
    console.log(`=== GREP: PRE-FILTERING MODE ${onlyPrefilter ? 'only prefilter' : ''}=== `);
    execSync(`${grepExpression} CYPRESS_GREP_PRE_FILTER=true CYPRESS_GREP_RESULTS_FILE='${prefilterFile}' ${script}`, {
      stdio: 'inherit',
    });
  
    if (onlyPrefilter) {
      console.log(`=== GREP: FINISHED prefiltring only, results in ${prefilterFile} === `);
      return;
    }
  }
  
  console.log('=== GREP: RUNNING TESTS === ');
  let specP;
  const fileSpecPatternOriginal = 'spec_pattern.json';
  if (existsSync(fileSpecPatternOriginal)) {
    try {
      specP = JSON.parse(readFileSync(fileSpecPatternOriginal)).specPattern;
    } catch (e) {
      // ign
    }
  }
  let specString = specP && !grep ? `CYPRESS_SPEC_PATTERN="[${specP}]"` : !onlyRunPrefiltered ? 'CYPRESS_SPEC_PATTERN="*.*no"' : '';
  
  if (existsSync(fileSpecPatternOriginal)) {
    rmSync(fileSpecPatternOriginal);
  }
  
  execSync(
    `${specString} ${grepExpression} CYPRESS_GREP_PRE_FILTER=false CYPRESS_GREP_RESULTS_FILE='${prefilterFile}' ${script}`,
    { stdio: 'inherit' },
  );

  if (!onlyRunPrefiltered && deletePrefilter && existsSync(prefilterFile)) {
    rmSync(prefilterFile);
  }

  console.log('=== GREP: FINISHED === ');
} catch (err) {
  console.log('=== GREP: FINISHED (exit code: 1) === ');
  process.exit(1);
}
