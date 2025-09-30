## API HTTP helpers

This folder contains lightweight helpers to standardize Axios usage across the app:

- `http.ts` exports `clientGet`, `clientPost`, and `clientPut` — helpers that accept an `AxiosInstance` and return `res.data` with generics. Prefer these at call sites so code doesn't access `res.data` directly and benefits from consistent typing.
- `phase4Client.ts` creates a typed `AxiosInstance` pre-configured for the API and exports small wrapper functions (e.g. `getForYou`, `getPreferences`) that already call the helpers.

Guidelines

- Import `clientGet`/`clientPost`/`clientPut` at module scope (not dynamically) so tests can mock the underlying `phase4Client` or wrappers reliably.
- Always annotate the helper call with a concrete generic when you know the response shape (e.g. `clientGet<MyType>(phase4Client, '/path')`).
- When updating tests, prefer mocking the exported wrapper functions in `phase4Client` or the `phase4Client` instance itself.

Example

const data = await clientGet<{ user: { id: string } }>(phase4Client, '/profile');

This returns the decoded `res.data` typed accordingly.
