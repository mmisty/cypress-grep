import { selectionTestGrep } from '../../src/utils/regexp';
import expect from 'expect';

describe('suite', () => {
  describe('select pseudo regexp', () => {
    its()
      .each([
        { desc: 'Check Match', checkReg: false },
        { desc: 'Check Regexp', checkReg: true },
      ])
      .each([
        {
          desc: 'tag',
          GREP: '@test',
          regExpected: /@test.*/i,
          cases: [
            { expectMatch: true, testLine: 'sdd @test dsd' },
            { expectMatch: true, testLine: 'sd @TEST' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
          ],
        },
        {
          desc: 'tag with dot',
          GREP: '@test.1',
          regExpected: /@test.1.*/i,
          cases: [
            { expectMatch: true, testLine: '@test.1' },
            { expectMatch: true, testLine: '@test11' },
            { expectMatch: false, testLine: '@test12' },
            { expectMatch: false, testLine: '@test.2' },
            { expectMatch: false, testLine: 'no' },
          ],
        },
        {
          desc: 'parenthesis',
          GREP: '(my test)',
          regExpected: /my test.*/i,
          cases: [
            { expectMatch: true, testLine: 'hello my test' },
            { expectMatch: false, testLine: 'my tes hello ' },
          ],
        },
        {
          desc: 'parenthesis several',
          GREP: '!(my test)&!(his test)',
          regExpected: /(?=.*^(?!.*my test.*))+(?=.*^(?!.*his test.*))+.*/i,
          cases: [
            { expectMatch: true, testLine: 'her test' },
            { expectMatch: false, testLine: 'my test' },
            { expectMatch: false, testLine: 'his test' },
            { expectMatch: true, testLine: 'his tesPP' },
          ],
        },
        {
          desc: 'parenthesis several complex',
          GREP: '(((her)&!(my test|his test)))',
          regExpected: /(?=.*her)+(?=.*^(?!.*(my test|his test).*))+.*/i,
          cases: [
            { expectMatch: true, testLine: 'test her' },
            { expectMatch: true, testLine: 'her test' },
            { expectMatch: false, testLine: 'her his test' },
            { expectMatch: false, testLine: 'her my test' },
            { expectMatch: false, testLine: 'my test' },
            { expectMatch: false, testLine: 'his test' },
          ],
        },
        {
          desc: 'tag with dot encoded',
          GREP: '@test\\.1',
          regExpected: /@test\.1.*/i,
          cases: [
            { expectMatch: true, testLine: '@test.1' },
            { expectMatch: false, testLine: '@test11' },
            { expectMatch: false, testLine: '@test12' },
            { expectMatch: false, testLine: '@test.2' },
            { expectMatch: false, testLine: 'no' },
          ],
        },
        {
          desc: 'tag with braces',
          GREP: '@test[12]',
          regExpected: /@test[12].*/i,
          cases: [
            { expectMatch: true, testLine: '@test1' },
            { expectMatch: true, testLine: '@test2' },
            { expectMatch: false, testLine: '@test3' },
            { expectMatch: true, testLine: '@test3 @test1' },
            { expectMatch: false, testLine: '@test.' },
            { expectMatch: false, testLine: 'no' },
          ],
        },
        {
          desc: 'not tag',
          GREP: '!@test',
          regExpected: /^(?!.*@test.*).*/i,
          cases: [
            { expectMatch: false, testLine: 'sdd @test dsd' },
            { expectMatch: false, testLine: 'sd @TEST' },
            { expectMatch: true, testLine: 'notest' },
            { expectMatch: true, testLine: '@otherTest' },
          ],
        },
        {
          desc: 'or',
          GREP: '@e2e|@regression',
          regExpected: /(@e2e|@regression).*/i,
          cases: [
            { expectMatch: true, testLine: 'sdd @e2e dsd' },
            { expectMatch: true, testLine: 'sd @regression' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
            { expectMatch: true, testLine: 'sdd @e2e @regression dsd' },
            { expectMatch: true, testLine: 'sdd  @regression @e2e dsd' },
          ],
        },
        {
          desc: 'or',
          GREP: '@e2e/@regression',
          regExpected: /(@e2e|@regression).*/i,
          cases: [
            { expectMatch: true, testLine: 'sdd @e2e dsd' },
            { expectMatch: true, testLine: 'sd @regression' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
            { expectMatch: true, testLine: 'sdd @e2e @regression dsd' },
            { expectMatch: true, testLine: 'sdd  @regression @e2e dsd' },
          ],
        },
        {
          desc: 'and',
          GREP: '@e2e&@regression',
          regExpected: /(?=.*@e2e)+(?=.*@regression)+.*/i,
          cases: [
            { expectMatch: false, testLine: 'sdd @e2e dsd' },
            { expectMatch: false, testLine: 'sd @regression' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
            { expectMatch: true, testLine: 'sdd @e2e @regression dsd' },
            { expectMatch: true, testLine: 'sdd  @regression @e2e dsd' },
            { expectMatch: true, testLine: '@regression@e2e' },
          ],
        },
        {
          desc: 'and several',
          GREP: '@e2e&@regression&@smoke',
          regExpected: /(?=.*@e2e)+(?=.*@regression)+(?=.*@smoke)+.*/i,
          cases: [
            { expectMatch: false, testLine: 'sdd @e2e dsd' },
            { expectMatch: false, testLine: 'sd @regression' },
            { expectMatch: false, testLine: 'sd @smoke' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
            { expectMatch: false, testLine: 'sdd @e2e @regression dsd' },
            { expectMatch: false, testLine: 'sdd  @regression @e2e dsd' },
            { expectMatch: true, testLine: 'sdd  @regression @e2e @smoke dsd' },
            { expectMatch: true, testLine: 'sdd  @regression@smoke@e2e' },
          ],
        },
        {
          desc: 'tag and not',
          GREP: '@test&!suite',
          regExpected: /(?=.*@test)+^(?!.*suite.*)+.*/i,
          cases: [
            { expectMatch: true, testLine: 'abc @test my world' },
            { expectMatch: true, testLine: '@test' },
            { expectMatch: true, testLine: '@TEST' },
            { expectMatch: false, testLine: 'abc @test my suite' },
            { expectMatch: false, testLine: 'suite abc @test my' },
            { expectMatch: false, testLine: 'abc my suite' },
          ],
        },
        {
          desc: 'not and not',
          GREP: '!@test&!@suite',
          regExpected: /(?=.*^(?!.*@test)+^(?!.*@suite.*).*)+.*/i,
          cases: [
            { expectMatch: true, testLine: 'abc my world' },
            { expectMatch: false, testLine: '@test' },
            { expectMatch: false, testLine: '@TEST' },
            { expectMatch: false, testLine: 'abc @test my suite' },
            { expectMatch: false, testLine: 'abc @test my @suite sd' },
            { expectMatch: false, testLine: '@suite abc my' },
          ],
        },

        {
          desc: 'not and not Inversed',
          GREP: '!(!@test&!@suite)',
          regExpected: /^(?!.*(?=.*^(?!.*@test)+^(?!.*@suite.*).*)+.*).*/i,
          cases: [
            { expectMatch: false, testLine: 'abc my world' },
            { expectMatch: false, testLine: '@suit abc my' },
            { expectMatch: true, testLine: '@test' },
            { expectMatch: true, testLine: '@TEST' },
            { expectMatch: true, testLine: 'abc @test my suite' },
            { expectMatch: true, testLine: 'abc @test my @suite sd' },
            { expectMatch: true, testLine: '@suite abc my' },
          ],
        },
        {
          desc: 'not and or combination',
          GREP: '!@test&(@suite|@tag)',
          regExpected: /(?=.*^(?!.*@test)+(?=.*(@suite|@tag).*))+.*/i,
          cases: [
            { expectMatch: false, testLine: 'abc my @test world' },
            { expectMatch: false, testLine: 'abc @suite @tag my @test world' },
            { expectMatch: false, testLine: 'abc @tag @suite my @test world' },
            { expectMatch: true, testLine: 'abc @tag @suite world' },
            { expectMatch: true, testLine: 'abc @suite @Tag world' },
            { expectMatch: false, testLine: 'abc my world' },
            { expectMatch: true, testLine: 'abc my @suite world' },
            { expectMatch: true, testLine: 'abc my @tag world' },
          ],
        },
        {
          desc: 'not and or combination different order',
          GREP: '(@suite|@tag)&!@test',
          regExpected: /(?=.*(@suite|@tag))+^(?!.*@test.*)+.*/i,
          cases: [
            { expectMatch: false, testLine: 'abc my @test world' },
            { expectMatch: false, testLine: 'abc @suite @tag my @test world' },
            { expectMatch: false, testLine: 'abc @tag @suite my @test world' },
            { expectMatch: true, testLine: 'abc @tag @suite world' },
            { expectMatch: true, testLine: 'abc @suite @Tag world' },
            { expectMatch: false, testLine: 'abc my world' },
            { expectMatch: true, testLine: 'abc my @suite world' },
            { expectMatch: true, testLine: 'abc my @tag world' },
          ],
        },
        {
          desc: 'and with parenthesis and or combination',
          GREP: '(@test&@suite)|@tag',
          regExpected: /((?=.*@test)+(?=.*@suite)+|@tag).*/i,
          cases: [
            { expectMatch: true, testLine: 'abc my @test @world @suite' },
            { expectMatch: false, testLine: 'abc my @suite' },
            { expectMatch: false, testLine: 'abc my @test' },
            { expectMatch: true, testLine: 'abc my @tag' },
            { expectMatch: true, testLine: 'abc my @test @tag' },
            { expectMatch: true, testLine: 'abc@suite my @test @tag' },
            { expectMatch: true, testLine: '@suite @test' },
          ],
        },
        {
          desc: 'and with parenthesis and or combination (diff writing)',
          GREP: '(@test|@tag)&(@suite|@tag)',
          regExpected: /(?=.*(@test|@tag))+(?=.*(@suite|@tag))+.*/i,
          cases: [
            { expectMatch: true, testLine: 'abc my @test @world @suite' },
            { expectMatch: false, testLine: 'abc my @suite' },
            { expectMatch: false, testLine: 'abc my @test' },
            { expectMatch: true, testLine: 'abc my @tag' },
            { expectMatch: true, testLine: 'abc my @test @tag' },
            { expectMatch: true, testLine: 'abc@suite my @test @tag' },
            { expectMatch: true, testLine: '@suite @test' },
          ],
        },
        {
          desc: 'not with parenthesis',
          GREP: '!(@test&@suite)',
          regExpected: /^(?!.*(?=.*@test)+(?=.*@suite)+.*).*/i,
          cases: [
            { expectMatch: false, testLine: '@test @suite' },
            { expectMatch: false, testLine: '@suite @test' },
            { expectMatch: true, testLine: '@suit @test' },
            { expectMatch: true, testLine: 'no suite test' },
            { expectMatch: true, testLine: 'only @test' },
            { expectMatch: true, testLine: 'only @TEST' },
            { expectMatch: true, testLine: 'only @suite' },
          ],
        },
      ])
      .each(t => [{ desc: `: '${t.GREP}'` }])
      .each(t => t.cases)
      // .only(t => t.id === '1')
      .run(t => {
        const regActual = selectionTestGrep(t.GREP);

        if (t.checkReg) {
          expect(regActual).toEqual(t.regExpected);

          return;
        }

        // remove actualResult when fixed
        if (t.expectMatch) {
          expect(t.testLine).toMatch(regActual);
        } else {
          expect(t.testLine).not.toMatch(regActual);
        }
      });
  });

  describe('select regexp', () => {
    its()
      .each([
        { desc: 'Check Match', checkReg: false },
        { desc: 'Check Regexp', checkReg: true },
      ])
      .each([
        {
          desc: 'tag case sensitive',
          GREP: '=/@test/',
          regExpected: /@test/,
          cases: [
            { expectMatch: true, testLine: '@test sdd @test dsd' },
            { expectMatch: true, testLine: '@test start dsd' },
            { expectMatch: true, testLine: 'sdd @test dsd' },
            { expectMatch: true, testLine: 'end @test' },
            { expectMatch: false, testLine: 'sd @TEST' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
          ],
        },
        {
          desc: 'tags case insensitive',
          GREP: '=/@test/i',
          regExpected: /@test/i,
          cases: [
            { expectMatch: true, testLine: '@test sdd @test dsd' },
            { expectMatch: true, testLine: '@test start dsd' },
            { expectMatch: true, testLine: 'sdd @test dsd' },
            { expectMatch: true, testLine: 'end @test' },
            { expectMatch: true, testLine: 'sd\n@test' },
            { expectMatch: true, testLine: 'sd @TEST' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
          ],
        },
        {
          desc: 'several tags insensitive',
          GREP: '=/@test|@test2/im',
          regExpected: /@test|@test2/im,
          cases: [
            { expectMatch: true, testLine: '@test sdd @test2 dsd' },
            { expectMatch: true, testLine: '@test2 start dsd' },
            { expectMatch: true, testLine: 'end @test' },
            { expectMatch: true, testLine: 'sd @TEST' },
            { expectMatch: true, testLine: 'sd\n@test' },
            { expectMatch: true, testLine: 'sd @TEST2' },
            { expectMatch: false, testLine: 'notest' },
            { expectMatch: false, testLine: '@otherTest' },
          ],
        },
      ])
      .each(t => t.cases)
      // .only(t => t.id === '1')
      .run(t => {
        const regActual = selectionTestGrep(t.GREP);

        if (t.checkReg) {
          expect(regActual).toEqual(t.regExpected);

          return;
        }

        if (t.expectMatch) {
          expect(t.testLine).toMatch(regActual);
        } else {
          expect(t.testLine).not.toMatch(regActual);
        }
      });
  });
});
