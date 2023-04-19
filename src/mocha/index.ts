// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-namespace
namespace Mocha {
  export interface GrepTagObject {
    tag: string;
    info?: string[];
  }
  export type GrepTagSimple = string;
  export type GrepTag = GrepTagObject | GrepTagSimple;

  export interface Test {
    tags?: GrepTagObject[];
    fullTitleWithTags?: string;
  }

  export interface Runnable {
    tags?: GrepTagObject[];
    fullTitleWithTags?: string;
  }
}
