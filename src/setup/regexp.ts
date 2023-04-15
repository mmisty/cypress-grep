// todo add link to readme
export const helpText = `
  <p>You can put regexp expression here to filter tests </p>
  <h2>Examples</h2>
  <h3>And</h3>
  <p>All tests with @tag1 and @tag2
    <pre>@tag1&@tag2</pre>
  </p>
  <h3>Or</h3>
  <p>All tests with @tag1 Or @tag2
  <pre>@tag1|@tag2</pre>
  </p>
   <h3>Not</h3>
   <p>
  All tests without @tag1 and without @tag2
  <pre>!@tag1&@tag2</pre>
  </p>
  
  <p><a href="link to git">more info</a></p>
 
`;

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
