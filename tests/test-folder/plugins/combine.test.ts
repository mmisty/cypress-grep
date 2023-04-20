import { fsMock, globMock } from '../../mocks/cy-mock';
import expect from 'expect';
import { createAllTestsFile } from '../../../src/plugins/all-tests-combine';

describe('suite', () => {
  it('test', () => {
    let checked = false;
    const mock = globMock();
    const fs = fsMock();
    mock.sync(pattern => {
      expect(pattern).toEqual(['**/*.tsMock']);

      return ['result', 'resu'];
    });
    fs.write((s, contents) => {
      expect(s).toEqual('outFilePath.tst');
      expect(contents).toEqual(
        "describe('', () => {\n" +
          '  describe(`${__dirname}ult`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('.ult');\n" +
          '  });\n' +
          '\n' +
          '  describe(`${__dirname}u`, () => {\n' +
          '    // eslint-disable-next-line import/extensions\n' +
          "    require('.u');\n" +
          '  });\n' +
          '});\n',
      );
      checked = true;
    });
    const res = createAllTestsFile('outFilePath.tst', 'sdds', '**/*.tsMock');
    expect(res).toEqual('outFilePath.tst');
    expect(checked).toEqual(true);
  });
});
