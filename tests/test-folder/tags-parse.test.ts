import expect from 'expect';
import { parseOneTag, parseTags, removeTagsFromTitle } from '../../src/utils/tags';

describe('tags', () => {
  its('should parse tags')
    .each([
      { title: undefined, tags: [] },
      { title: 'title', tags: [] },
      {
        title: 'title @tag1',
        tags: [{ info: [], tag: 'tag1' }],
      },
      {
        title: '@tag1 title ',
        tags: [{ info: [], tag: 'tag1' }],
      },
      {
        title: '@tag1@tag2 title ',
        tags: [
          { info: [], tag: 'tag1' },
          { info: [], tag: 'tag2' },
        ],
      },
      {
        title: 'title @tag1 @tag2',
        tags: [
          { info: [], tag: 'tag1' },
          { info: [], tag: 'tag2' },
        ],
      },
      {
        title: 'title @tag1 @tag2 ',
        tags: [
          { info: [], tag: 'tag1' },
          { info: [], tag: 'tag2' },
        ],
      },
      {
        title: 'title@tag1@tag2',
        tags: [
          { info: [], tag: 'tag1' },
          { info: [], tag: 'tag2' },
        ],
      },
      {
        title: '@tag1 title@tag2@tag3',
        tags: [
          { info: [], tag: 'tag1' },
          { info: [], tag: 'tag2' },
          { info: [], tag: 'tag3' },
        ],
      },
      {
        title: 'title@tag1("Some test")@tag2',
        tags: [
          { info: ['Some test'], tag: 'tag1' },
          { info: [], tag: 'tag2' },
        ],
      },
      { title: 'title@tag1("Some test")', tags: [{ info: ['Some test'], tag: 'tag1' }] },
      { title: '@tag1("Some test") title', tags: [{ info: ['Some test'], tag: 'tag1' }] },
      {
        title: 'title@tag1("Some","Some2 here")',
        tags: [{ info: ['Some', 'Some2 here'], tag: 'tag1' }],
      },
      {
        desc: 'double quotes with parentesis',
        title: 'title@tag1("Timed out retrying after 100ms: expect(received).toMatch(expected)")',
        tags: [
          {
            info: ['Timed out retrying after 100ms: expect(received).toMatch(expected)'],
            tag: 'tag1',
          },
        ],
      },
      {
        desc: 'single quotes with parentesis',
        title: "title@tag1('Timed out retrying after 100ms: expect(received).toMatch(expected)')",
        tags: [
          {
            info: ['Timed out retrying after 100ms: expect(received).toMatch(expected)'],
            tag: 'tag1',
          },
        ],
      },
      {
        title: "title@tag1('start%20%40%22hello%22%20123%20buybuy')",
        tags: [
          {
            info: ['start @"hello" 123 buybuy'],
            tag: 'tag1',
          },
        ],
      },
      {
        title: 'Test nme @negative("Use%20%22equals3%22%20ffinstead%20of%20text%20for%20location")',
        tags: [
          {
            info: ['Use "equals3" ffinstead of text for location'],
            tag: 'negative',
          },
        ],
      },
      {
        title: 'Test name @negative("expected%20%27%27%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F")',
        tags: [
          {
            info: ["expected '' to match /^[^><]+$/"],
            tag: 'negative',
          },
        ],
      },
      {
        title: 'Test name @negative("expected%20%27%27%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F%20%23%23%23")',
        tags: [
          {
            info: ["expected '' to match /^[^><]+$/ ###"],
            tag: 'negative',
          },
        ],
      },
      {
        title: 'Test name @negative("expected%20%22%22%20to%20match%20%2F%5E%5B%5E%3E%3C%5D%2B%24%2F%20%23%23%23")',
        tags: [
          {
            info: ['expected "" to match /^[^><]+$/ ###'],
            tag: 'negative',
          },
        ],
      },
      {
        desc: 'other specials',
        title: 'Test name @negative("expected%20%25123%20to%20match%20%24%5E%5E%5E%20%23%23%23%3F%3A%2F%2F%5C%7C%7C")',
        tags: [
          {
            info: ['expected %123 to match $^^^ ###?://\\||'],
            tag: 'negative',
          },
        ],
      },
    ])
    .run(t => {
      expect(parseTags(t.title as string)).toEqual(t.tags);
    });

  its('should correctly remove tags from title')
    .each([
      { title: 'title', exp: 'title' },
      { title: 'title @tag1', exp: 'title' },
      { title: '@tag1 title ', exp: 'title' },
      { title: '@tag1@tag2 title ', exp: 'title' },
      { title: 'title @tag1 @tag2', exp: 'title' },
      { title: 'title @tag1 @tag2 ', exp: 'title' },
      { title: 'title@tag1@tag2', exp: 'title' },
      { title: '@tag1 title@tag2@tag3', exp: 'title' },
      { title: '@tag1 title@tag2 title 2@tag3', exp: 'title title 2' },
      { title: '@tag1("Some test") title', exp: 'title' },
      { title: '@tag1("Some test") title@tag2("Some test")', exp: 'title' },
      { title: '@tag1("Some test,%20%40hello") title@tag2("Some test")', exp: 'title' },
    ])
    .run(t => {
      expect(removeTagsFromTitle(t.title)).toEqual(t.exp);
    });

  describe('should parse one tag', () => {
    it('should parse one tag with no reason', () => {
      expect(parseOneTag('@defe')).toEqual({
        tag: 'defe',
        info: [],
      });
    });

    it('should parse one tag with one reason', () => {
      expect(parseOneTag('@defe:desc("Some test%30%20%40hello")')).toEqual({
        tag: 'defe:desc',
        info: ['Some test0 @hello'],
      });
    });

    it('should parse one tag', () => {
      expect(parseOneTag('@defe:desc("Some test%30%20%40hello","Some test 2%30%20%40hello")')).toEqual({
        tag: 'defe:desc',
        info: ['Some test0 @hello', 'Some test 20 @hello'],
      });
    });

    it('should parse one tag when quotes', () => {
      expect(parseOneTag('@defe:desc("Some%22test%22%30%20%40hello","Some %22test%22 2%30%20%40hello")')).toEqual({
        info: ['Some"test"0 @hello', 'Some "test" 20 @hello'],
        tag: 'defe:desc',
      });
    });
  });
});
