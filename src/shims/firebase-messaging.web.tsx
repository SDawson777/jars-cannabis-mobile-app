export default function messaging() {
  return {
    AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2 },
    async requestPermission() { return 0; },
    async getToken() { return ''; },
    setBackgroundMessageHandler() {},
    onMessage() { return () => {}; },
    onNotificationOpenedApp() { return () => {}; },
    async getInitialNotification() { return null; },
  } as any;
}

