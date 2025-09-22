/* Type declarations for Detox E2E globals used in tests */

declare const device: any;
declare const by: {
  id: (s: string) => any;
  text: (s: string) => any;
  label: (s: string) => any;
};
declare function element(query: any): any;
declare function waitFor(target: any): any;
