describe('empty spec1', { tags: ['@parent'] }, () => {
  it('passes just parent', { tags: '@P1' }, () => {
    expect('cy').eq('cy');
  });

  describe('empty spec2', { tags: ['@hell'] }, () => {
    describe('empty spec3', { tags: ['@deep'] }, () => {
      it('passes t1', { tags: ['@t1'] }, () => {
        expect('cy').eq('cy');
      });

      it('passes t2', { tags: '@t2' }, () => {
        expect('cy').eq('cy');
      });

      it.skip('passes t4', { tags: '@t4' }, () => {
        expect('cy').eq('cy');
      });
    });
  });

  it('passes t41 @tagInTitle', () => {
    expect('cy').eq('cy');
  });

  it('passes t4 @tagInTitle', () => {
    expect('cy').eq('cy');
  });
  it('passes t43 @tagInTitle', () => {
    expect('cy').eq('cy');
  });
  it('passes t44 @tagInTitle', () => {
    expect('cy').eq('cy');
  });
  it('passes t45 @tagInTitle', () => {
    expect('cy').eq('cy');
  });
  it('passes t4 @tagInTitle', () => {
    expect('cy').eq('cy');
  });
});
