const regexTagsNoReasons = '(@[^@ ()"\']+)';
const regexDiffQuotes = ['"', "'"].map(t => `(@[^@ ]+\\(${t}[^@${t}]+${t}(?:,\\s*${t}[^@${t}]+${t})*\\))`);
const tagsRegex = new RegExp(`${regexDiffQuotes.join('|')}|${regexTagsNoReasons}`, 'g');

export const removeTagsFromTitle = (str: string): string => {
  let resultStr = str;
  const found = str?.match(tagsRegex);

  if (found != null) {
    // eslint-disable-next-line no-return-assign
    found.forEach(p => (resultStr = resultStr.replace(p, '')));
  }

  return resultStr;
};
type Tag = { tag: string; failReasons: string[] };

const searchParams = [
  {
    sym: "'",
    map: '%27',
  },
];

const encodeDecode = (str: string, isEncode: boolean) => {
  let newStr = str;

  searchParams.forEach(
    // eslint-disable-next-line no-return-assign
    t => (newStr = newStr.replace(new RegExp(`${isEncode ? t.sym : t.map}`, 'g'), isEncode ? t.map : t.sym)),
  );

  return newStr;
};

// const encodeFailReason = (str: string) => encodeDecode(encodeURIComponent(str), true);
const decodeFailReason = (str: string) => encodeDecode(decodeURIComponent(str), false);

export const parseOneTag = (tg: string): Tag => {
  const reasons: string[] = [];
  let tagResult = '';
  const regexpReasons = /\((.*)\)$/;
  const regexpTag = /^@([^(@]+)(?:\(|$)/;
  const reasonsMatch = tg.match(regexpReasons);

  if (reasonsMatch != null) {
    reasons.push(
      ...reasonsMatch[1]
        .split(',')
        .map(p => p.replace(/^"(.*)"$/, '$1'))
        .map(p => p.replace(/^'(.*)'$/, '$1'))
        .map(k => decodeFailReason(k)),
    );
  }
  const tagMatch = tg.match(regexpTag);

  if (tagMatch != null) {
    // eslint-disable-next-line prefer-destructuring
    tagResult = tagMatch[1];
  }

  return {
    tag: tagResult,
    failReasons: reasons,
  };
};

export const parseTags = (str: string): Tag[] => {
  const tags: Tag[] = [];
  const found = str?.match(tagsRegex);

  if (found != null) {
    tags.push(...found.map(p => parseOneTag(p)));
  }

  return tags;
};
