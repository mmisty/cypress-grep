const reportDir = process.env.COVERAGE_REPORT_DIR ?? 'coverage-nyc';
const tempDir = process.env.COVERAGE_TEMP ?? 'reports/.nyc_output';

module.exports = {
  all: true,
  cache: false,
  reporter: ['json', 'lcov', 'text', 'cobertura', 'clover'],
  include: ['src/**'],
  exclude: [
    '*.*',
    'integration',
    'lib',
    'js-files-cypress',
    'tests',
    'reports',
    'cypress/e2e',
    'cypress/plugins',
    'cypress/*.*',
    'src/cypress',
    'src/mocha',
    '*.types.ts',
    'types.ts',
  ],
  sourceMap: false,
  instrument: false,
  'report-dir': reportDir,
  'temp-dir': tempDir,
  branches: 80,
  lines: 60,
  functions: 60,
  statements: 80,
};
