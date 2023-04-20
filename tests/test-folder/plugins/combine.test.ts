import { fsMock, globMock } from '../../mocks/cy-mock';
import expect from 'expect';
import { createAllTestsFile } from '../../../src/plugins/all-tests-combine';
import { consoleMock } from '../../mocks/console-mock';

describe('combine all tests', () => {
  it('should create file with all tests', () => {
    let checked = false;
    const mock = globMock();
    const fs = fsMock();
    const mockConsole = consoleMock();

    mock.sync(pattern => {
      expect(pattern).toEqual(['integration/**/*.tsMock']);

      return ['integration/e2e/test1.tsMock', 'integration/e2e/test0.tsMock', 'integration/e2e/sub/test2.tsMock'];
    });

    fs.write((s, contents) => {
      expect(s).toEqual('outFilePath.tst');
      expect(contents).toEqual(
        "describe('', () => {\n" +
          '  describe(`${__dirname}/test1.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./test1.tsMock');\n" +
          '  });\n' +
          '\n' +
          '  describe(`${__dirname}/test0.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./test0.tsMock');\n" +
          '  });\n' +
          '\n' +
          '  describe(`${__dirname}/sub/test2.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./sub/test2.tsMock');\n" +
          '  });\n' +
          '});\n',
      );
      checked = true;
    });
    const res = createAllTestsFile('outFilePath.tst', 'integration/e2e', 'integration/**/*.tsMock');
    expect(res).toEqual('outFilePath.tst');
    expect(checked).toEqual(true);
    expect(mockConsole.log.mock.calls[0]).toEqual(["[cypress-grep] Created file with all tests 'outFilePath.tst'"]);
  });

  it('should create file with all tests several patterns', () => {
    let checked = false;
    const mock = globMock();
    const fs = fsMock();
    const mockConsole = consoleMock();

    mock.sync(pattern => {
      expect(pattern).toEqual([['integration/**/*.tsMock', 'integration/**/*.cy.ts']]);

      return ['integration/e2e/test1.tsMock', 'integration/e2e/test0.tsMock', 'integration/e2e/sub/test2.tsMock'];
    });

    fs.write((s, contents) => {
      expect(s).toEqual('outFilePath.tst');
      expect(contents).toEqual(
        "describe('', () => {\n" +
          '  describe(`${__dirname}/test1.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./test1.tsMock');\n" +
          '  });\n' +
          '\n' +
          '  describe(`${__dirname}/test0.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./test0.tsMock');\n" +
          '  });\n' +
          '\n' +
          '  describe(`${__dirname}/sub/test2.tsMock`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('./sub/test2.tsMock');\n" +
          '  });\n' +
          '});\n',
      );
      checked = true;
    });

    const res = createAllTestsFile('outFilePath.tst', 'integration/e2e', [
      'integration/**/*.tsMock',
      'integration/**/*.cy.ts',
    ]);
    expect(res).toEqual('outFilePath.tst');
    expect(checked).toEqual(true);
    expect(mockConsole.log.mock.calls[0]).toEqual(["[cypress-grep] Created file with all tests 'outFilePath.tst'"]);
  });
});
