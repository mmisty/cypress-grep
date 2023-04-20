import fs from 'fs';

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
