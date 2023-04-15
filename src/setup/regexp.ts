// todo make a note
export const selectionTestGrep = (str: string): RegExp => {
  // '=/hello$/i'
  if (str.startsWith('=')) {
    const beg = str.slice(1);
    const endOfExpr = beg.lastIndexOf('/');
    const flags = endOfExpr < beg.length - 1 ? beg.slice(endOfExpr + 1) : '';
    const expr = beg.slice(beg.indexOf('/') + 1, endOfExpr);

    return new RegExp(expr, flags);
  }

  const reg = str
    .split('/')
    .map(t => (t.startsWith('!') ? t.replace(/^!(.*)/, '^(?!.*$1)') : t))
    .map(t =>
      t.indexOf('&') !== -1
        ? t
            .split('&')
            .map(nd => (nd.startsWith('!') ? nd.replace(/^!(.*)/, '^(?!.*$1)') : nd.replace(/^(.*)/, '(?=.*$1)')))
            .join('+')
        : t,
    )
    .join('|');

  return new RegExp(`${reg}.*`, 'i');
};
