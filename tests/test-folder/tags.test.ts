import expect from 'expect';
import { selectionTestGrep } from '../../src/utils/regexp';
import { parseInlineTags, uniqTags } from '../../src/utils/tags';
import { tag } from '../../src/utils/tags';

describe('utils', () => {
  describe('uniqTags', () => {
    its()
      .each([
        {
          tags: [{ tag: '@ff' }, { tag: '@ff' }],
          exp: [{ tag: '@ff' }],
        },
        {
          tags: [{ tag: '@f2' }, { tag: '@f1' }],
          exp: [{ tag: '@f2' }, { tag: '@f1' }],
        },
        {
          tags: [{ tag: '@f2' }, { tag: '@f2' }, { tag: '@f1' }],
          exp: [{ tag: '@f2' }, { tag: '@f1' }],
        },
        {
          tags: [],
          exp: [],
        },
      ])
      .run(t => {
        const reg = uniqTags(t.tags);

        expect(reg).toEqual(t.exp);
      });
  });

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

  describe('tag with info', () => {
    its()
      .each([
        { tag: 'my', info: [], exp: '@my' },
        { tag: 'my', info: ['issue'], exp: '@my("issue")' },
        { tag: 'myTag', info: ['issue with spaces'], exp: '@myTag("issue%20with%20spaces")' },
        { tag: 'myTag', info: ['issue with spaces', 'other'], exp: '@myTag("issue%20with%20spaces","other")' },
      ])

      .run(t => {
        const res = tag(t.tag, ...t.info);

        expect(res).toEqual(t.exp);
      });
  });

  describe('parseInlineTags', () => {
    its('should parse tags')
      .each([
        { title: 'title', tags: [] },
        {
          title: 'title @tag1',
          tags: [{ info: [], tag: '@tag1' }],
        },
        {
          title: '@tag1 title ',
          tags: [{ info: [], tag: '@tag1' }],
        },
        {
          title: '@tag1@tag2 title ',
          tags: [
            { info: [], tag: '@tag1' },
            { info: [], tag: '@tag2' },
          ],
        },
        {
          title: 'title @tag1 @tag2',
          tags: [
            { info: [], tag: '@tag1' },
            { info: [], tag: '@tag2' },
          ],
        },
        {
          title: 'title @tag1 @tag2 ',
          tags: [
            { info: [], tag: '@tag1' },
            { info: [], tag: '@tag2' },
          ],
        },
        {
          title: 'title@tag1@tag2',
          tags: [
            { info: [], tag: '@tag1' },
            { info: [], tag: '@tag2' },
          ],
        },
        {
          title: '@tag1 title@tag2@tag3',
          tags: [
            { info: [], tag: '@tag1' },
            { info: [], tag: '@tag2' },
            { info: [], tag: '@tag3' },
          ],
        },
        {
          title: 'title@tag1("Some test")@tag2',
          tags: [
            { info: ['Some test'], tag: '@tag1' },
            { info: [], tag: '@tag2' },
          ],
        },
        { title: 'title@tag1("Some test")', tags: [{ info: ['Some test'], tag: '@tag1' }] },
        { title: '@tag1("Some test") title', tags: [{ info: ['Some test'], tag: '@tag1' }] },
        {
          title: 'title@tag1("Some","Some2 here")',
          tags: [{ info: ['Some', 'Some2 here'], tag: '@tag1' }],
        },
        {
          desc: 'double quotes with parentesis',
          title: 'title@tag1("Timed out retrying after 100ms: expect(received).toMatch(expected)")',
          tags: [
            {
              info: ['Timed out retrying after 100ms: expect(received).toMatch(expected)'],
              tag: '@tag1',
            },
          ],
        },
        {
          desc: 'single quotes with parentesis',
          title: "title@tag1('Timed out retrying after 100ms: expect(received).toMatch(expected)')",
          tags: [
            {
              info: ['Timed out retrying after 100ms: expect(received).toMatch(expected)'],
              tag: '@tag1',
            },
          ],
        },
        {
          title: "title@tag1('start%20%40%22hello%22%20123%20buybuy')",
          tags: [
            {
              info: ['start @"hello" 123 buybuy'],
              tag: '@tag1',
            },
          ],
        },
        {
          title: 'Test nme @negative("Use%20%22equals3%22%20ffinstead%20of%20text%20for%20location")',
          tags: [
            {
              info: ['Use "equals3" ffinstead of text for location'],
              tag: '@negative',
            },
          ],
        },
        {
          title: 'Test name @negative("expected%20%27%27%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F")',
          tags: [
            {
              info: ["expected '' to match /^[^><]+$/"],
              tag: '@negative',
            },
          ],
        },
        {
          title: 'Test name @negative("expected%20%27%27%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F%20%23%23%23")',
          tags: [
            {
              info: ["expected '' to match /^[^><]+$/ ###"],
              tag: '@negative',
            },
          ],
        },
        {
          title: 'Test name @negative("expected%20%22%22%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F%20%23%23%23")',
          tags: [
            {
              info: ['expected "" to match /^[^><]+$/ ###'],
              tag: '@negative',
            },
          ],
        },
        {
          desc: 'other specials',
          title:
            'Test name @negative("expected%20%25123%20to%20match%20%24%5E%5E%5E%20%23%23%23%3F%3A%2F%2F%5C%7C%7C")',
          tags: [
            {
              info: ['expected %123 to match $^^^ ###?://\\||'],
              tag: '@negative',
            },
          ],
        },
      ])
      .run(t => {
        expect(parseInlineTags(t.title)).toEqual(t.tags);
      });
  });
});
