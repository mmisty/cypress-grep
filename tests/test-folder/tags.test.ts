import expect from 'expect';
import { selectionTestGrep } from '../../src/utils/regexp';

describe('utils', () => {
  describe('should grep', () => {
    its()
      .each([
        {
          str: '!@api',
          cases: [
            { input: '', expMatch: true },
            { input: '@api', expMatch: false },
            { input: 'my test title @abc', expMatch: true },
            { input: 'my test title @api @abc', expMatch: false },
          ],
        },
        {
          str: '!@api&@abc',
          cases: [
            { input: '', expMatch: false },
            { input: '@abc', expMatch: true },
            { input: 'my title @abc @api', expMatch: false },
            { input: 'my title @abc @other tag', expMatch: true },
          ],
        },
        {
          str: '!@api&@abc/@e2e',
          cases: [
            { input: '@e2e', expMatch: true },
            { input: '@abc', expMatch: true },
            { input: 'my title @abc @api', expMatch: false },
            { input: 'my title @abc @other tag', expMatch: true },
          ],
        },
        {
          str: '!@api&@abc&@e2e',
          cases: [
            { input: '@e2e some other @api else @abc', expMatch: false },
            { input: '@e2e some other @other else @abc', expMatch: true },
          ],
        },
        {
          str: '!@api&@abc&!@e2e',
          cases: [
            { input: '@e2e some other @api else @abc', expMatch: false },
            { input: '@e2e some other @other else @abc', expMatch: false },
            { input: 'some other @other else @abc', expMatch: true },
            { input: 'some other @api else @abc', expMatch: false },
            { input: 'some other title', expMatch: false },
          ],
        },
        {
          str: '!@api&@abc/!@e2e',
          cases: [
            { input: '@e2e some otherelse @abc', expMatch: true },
            { input: '@e2e some otherelse @api', expMatch: false },
            { input: '123v @abc some other else', expMatch: true },
          ],
        },

        {
          str: '=/some/',
          cases: [
            { input: '@e2e some otherelse @abc', expMatch: true },
            { input: '@e2e Some otherelse @api', expMatch: false },
          ],
        },
        {
          str: '=/^(?!.*some).*/',
          cases: [
            { input: '@e2e some otherelse @abc', expMatch: false },
            { input: '@e2e Some otherelse @api', expMatch: true },
          ],
        },
      ])
      .each(t => t.cases)
      .run(t => {
        const reg = selectionTestGrep(t.str);

        if (t.expMatch) {
          expect(t.input).toMatch(reg);
        } else {
          expect(t.input).not.toMatch(reg);
        }
      });
  });
});
