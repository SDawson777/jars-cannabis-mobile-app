// Type stub to satisfy TS when resolving react-native/jest/* modules.
// These upstream files are Flow-typed; we redirect them to lightweight mocks in JS.
declare module 'react-native/jest/*' {
  const anyExport: any;
  export = anyExport;
}
