// when experession !(<expression>)
const transformReversed = (isInversed: boolean, s: string) => {
  s = isInversed ? s.slice(2) : s;
  s = isInversed ? s.slice(0, s.length - 2) : s;

  return s;
};

export const selectionTestGrep = (str: string): RegExp => {
  if (str.startsWith('=')) {
    // expressions like '=/hello$/i'
    const beg = str.slice(1);
    const endOfExpr = beg.lastIndexOf('/');
    const flags = endOfExpr < beg.length - 1 ? beg.slice(endOfExpr + 1) : '';
    const expr = beg.slice(beg.indexOf('/') + 1, endOfExpr);

    return new RegExp(expr, flags);
  }

  const isInverse = str.startsWith('!(');
  const transformed = transformReversed(isInverse, str);

  const reg = transformed
    .split('/')
    .map(t => (t.startsWith('!') ? t.replace(/^!(.*)/, '^(?!.*$1.*)') : t))
    .map(t =>
      t.indexOf('&') !== -1
        ? `${t
            .split('&')
            .map(nd => (nd.startsWith('!') ? nd.replace(/^!(.*)/, '^(?!.*$1)') : nd.replace(/^(.*)/, '(?=.*$1)')))
            .join('+')}+`
        : t,
    )
    .join('|');

  return new RegExp(isInverse ? `^(?!.*${reg}).*` : `${reg}.*`, 'i');
};
