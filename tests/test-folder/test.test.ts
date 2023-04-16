// jest tests to test plugins
import { expect } from 'expect';

describe('suite', () => {
  // when many test cases
  its('test its')
    .each([{ abc: 1 }, { abc: 2 }, { abc: 3 }])
    .run(t => {
      expect(t.abc).not.toBeUndefined();
    });
});
