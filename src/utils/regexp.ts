type Replacement = { order: number; mapName: string; exp: string; inverse: boolean };

export const simplifyParentheses = (input: string): string => {
  // Replace deeply nested parentheses with a single group
  let simplified = input;

  while (/\(\(([^()]+)\)\)/.test(simplified)) {
    simplified = simplified.replace(/\(\(([^()]+)\)\)/, '($1)');
  }

  return simplified.replace(/&\(\.\*\)/g, '');
};

/**
 * replace all parenthesis groups with placeholder
 * @param input
 * @param replacements
 * @param num
 */
export const replaceParenthesisGroups = (input: string, replacements: Replacement[], num = 1): string => {
  let replaced = simplifyParentheses(input);
  const groupsNeg = input.match(/!\(([^()]*)\)/);
  const groups = input.match(/\(([^()]*)\)/);

  if (!groupsNeg && !groups) {
    return replaced;
  }

  const replaceExpression = (expression: string, group: string, inverse: boolean) => {
    const mapName = `##R${num}##`;
    replacements.push({ mapName, exp: group, inverse, order: num });
    replaced = replaced.replace(expression, mapName);

    return replaceParenthesisGroups(replaced, replacements, num + 1);
  };

  if (groupsNeg) {
    return replaceExpression(groupsNeg[0], groupsNeg[1], true);
  } else if (groups) {
    if (replaced === '(.*)') {
      return '';
    }

    return replaceExpression(groups[0], groups[1], false);
  }

  return replaced;
};

/**
 * no parenthesis in the group
 * @param exp
 * @param inverse
 */
export const convertOneGroup = (exp: string, inverse: boolean): string => {
  const reg = exp
    .split('/')
    .map(t => (t.startsWith('!') ? t.replace(/^!(.*)/, '^(?!.*$1.*)') : t))
    .map(t =>
      t.indexOf('&') !== -1
        ? `${t
            .split('&')
            .map(nd => (nd.startsWith('!') ? nd.replace(/^!(.*)/, '^(?!.*$1.*)') : nd.replace(/^(.*)/, '(?=.*$1)')))
            .join('+')}+`
        : t,
    )
    .join('|');

  const res = reg.indexOf('|') !== -1 ? `(${reg})` : reg;

  return inverse ? `^(?!.*${res}.*)` : `${res}`;
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
  const leftParenth = '##LP##';
  const rightParenth = '##RP##';
  const replacements: Replacement[] = [];

  str = str.replace(/\\\(/g, leftParenth).replace(/\\\)/g, rightParenth);
  const replacedString = replaceParenthesisGroups(str, replacements);
  let convertedString = convertOneGroup(replacedString, false);
  const groups = replacements.map(t => ({ ...t, reg: convertOneGroup(t.exp, t.inverse) }));

  // last group should be converted first
  groups
    .sort((a, b) => (a.order > b.order ? -1 : 1))
    .forEach(r => {
      convertedString = convertedString.replace(r.mapName, r.reg);
    });

  convertedString = convertedString
    .replace(/\.\*\.\*/g, '.*')
    .replace(new RegExp(leftParenth, 'g'), '\\(')
    .replace(new RegExp(rightParenth, 'g'), '\\)');

  return new RegExp(`${convertedString}.*`, 'i');
};
