// Manual Jest mock for @sentry/react-native used during tests.
module.exports = {
  addBreadcrumb: () => {},
  addEventProcessor: () => {},
  captureException: () => {},
  captureEvent: () => {},
  captureMessage: () => {},
  init: () => {},
  setUser: () => {},
  setContext: () => {},
  Scope: function Scope() {},
  withScope: (fn) => fn && fn(),
  lastEventId: () => null,
};
