// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-namespace
namespace Mocha {
  export type GrepTagObject = import('../common/types').GrepTagObject;

  export interface Test {
    tags?: GrepTagObject[];
    fullTitleWithTags?: string;
  }

  export interface Runnable {
    tags?: GrepTagObject[];
    fullTitleWithTags?: string;
  }
}
