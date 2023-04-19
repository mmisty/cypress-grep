export const uniq = <T extends string>(arr: T[]): T[] => {
  return arr.filter((str, index, self) => self.indexOf(str) === index);
};
