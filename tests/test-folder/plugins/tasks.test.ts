import expect from 'expect';
import { taskWrite } from '../../../src/plugins/tasks';
import { fsMock } from '../../mocks/cy-mock';

describe('plugin/tasks', () => {
  it('writeTempFileWithSelectedTests', () => {
    let checked = false;
    const mock = fsMock();
    mock.write((pathFiltered, contents) => {
      expect(pathFiltered).toEqual('filteredSpecsPath');
      expect(contents).toEqual(
        '{\n' +
          '  "parentFolder": "parentFolderPath",\n' +
          '  "filtered": 1,\n' +
          '  "grep": "ssa",\n' +
          '  "total": 3,\n' +
          '  "tests": [\n' +
          '    {\n' +
          '      "filePath": "sdsd",\n' +
          '      "tags": [\n' +
          '        "@tags"\n' +
          '      ]\n' +
          '    }\n' +
          '  ]\n' +
          '}',
      );
      checked = true;
    });

    const task = taskWrite('parentFolderPath', 'filteredSpecsPath');
    task.writeTempFileWithSelectedTests({
      filtered: 1,
      grep: 'ssa',
      total: 3,
      tests: [
        {
          filePath: 'sdsd',
          tags: ['@tags'],
        },
      ],
    });
    expect(checked).toEqual(true);
  });
});
