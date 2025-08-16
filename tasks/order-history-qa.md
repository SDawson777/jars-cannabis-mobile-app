# Order History Screen QA Checklist

- [ ] Place order → confirm appears in history.
  - Issue: expo CLI missing (`npm run start` → "expo: not found"), so order placement could not be verified.
- [ ] Tap order → modal shows correct details.
  - Blocked: app failed to start; modal details remain unverified.
- [ ] Offline mode → error toast shown.
  - Blocked: offline behavior not tested without running app.
- [ ] Large number of orders → scrollable list performs smoothly.
  - Blocked: unable to generate bulk orders without a running app.
- [ ] Test in both dark and light themes.
  - Blocked: theme variants untested; expo CLI unavailable.
