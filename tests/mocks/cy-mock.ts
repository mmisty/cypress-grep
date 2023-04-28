import fs from 'fs';
import glob from 'fast-glob';

export const cyMock = () => {
  (global as any).cy = {
    window() {
      return {
        then: (callback: (w: any) => void) => callback(window),
      };
    },
  };
};

export const fsMock = () => {
  const write = jest.spyOn(fs, 'writeFileSync');

  return {
    write: (impl: (path: string, contents: string) => void) => {
      write.mockImplementation((a: any, b: any) => {
        impl(a, b);
      });
    },
  };
};

export const globMock = () => {
  const globMock = jest.spyOn(glob, 'sync');

  return {
    sync: (impl: (pattern: string | string[]) => string[]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      globMock.mockImplementation((...pattern: any[]) => {
        return impl(pattern);
      });
    },
  };
};
