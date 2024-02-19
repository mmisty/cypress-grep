type Replacement = { mapName: string; exp: string; inverse: boolean };

/**
 * replace all parenthesis groups with placesholder
 * @param input
 * @param replacements
 * @param num
 */
const replaceParenthesis = (input: string, replacements: Replacement[], num = 1) => {
  const groupsNeg = input.match(/!\(([^()]*)\)/);
  const groups = input.match(/\(([^()]*)\)/);

  const mapName = `##R${num}##`;

  if (groupsNeg) {
    replacements.push({ mapName, exp: groupsNeg[1], inverse: true });
    input = input.replace(groupsNeg[0], mapName);

    return replaceParenthesis(input, replacements, num + 1);
  } else if (groups) {
    replacements.push({ mapName, exp: groups[1], inverse: false });

    input = input.replace(groups[0], mapName);

    return replaceParenthesis(input, replacements, num + 1);
  }

  return input;
};

/**
 * no parenthesis in the group
 * @param exp
 * @param inverse
 */
const convertOneGroup = (exp: string, inverse: boolean): string => {
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

  const replacements: Replacement[] = [];
  const replacedString = replaceParenthesis(str, replacements);
  let convertedString = convertOneGroup(replacedString, false);
  const groups = replacements.map(t => ({ ...t, reg: convertOneGroup(t.exp, t.inverse) }));

  // last group should be converted first
  groups
    .sort((a, b) => (a.mapName > b.mapName ? -1 : 1))
    .forEach(r => {
      convertedString = convertedString.replace(r.mapName, r.reg);
    });

  return new RegExp(`${convertedString}.*`, 'i');
};
