/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
export default {
  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/private/var/folders/6f/d9kprl0960q717q05drlsg5w0000gn/T/jest_dx",
  verbose: true,
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'src/*.{ts,tsx}',
    '!**/integration/**',
    '!**/lib/**',
    '!src/mocha/**',
    '!src/**/*.types.ts',
    '!**/node_modules/**',
    '!**/mocks.ts',
    '!*.types.ts',
    '!**/types.ts',
    '!types.ts',
  ],

  // The directory where Jest should output its coverage files
  // coverageDirectory: "jest-coverage",

  // Indicates which provider should be used to instrument code for coverage
  // coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'cobertura', 'clover'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/test-folder/**/?(*.)+(spec|test).[tj]s?(x)',
    '**/tests/test-folder/?(*.)+(spec|test).[tj]s?(x)',
    '!**/lib/**/*.*',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '.(ts)$': 'ts-jest',
  },

  setupFilesAfterEnv: ['./jest.setup.js'],
};
