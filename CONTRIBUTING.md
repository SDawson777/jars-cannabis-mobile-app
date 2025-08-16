# Contributing

Thanks for your interest in improving this project! Follow the steps below to get started.

## Development Workflow

1. Fork the repository and create your feature branch from `main`.
2. Install dependencies and set up the project:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
3. Make your changes and commit using descriptive messages.
4. Run linting, type checks, and tests (see below) before submitting a pull request.
5. Open a PR and describe your changes clearly.

## Coding Standards

- All code is written in **TypeScript**.
- Ensure files pass **ESLint** and are formatted with **Prettier**.
- Keep functions small and well‑documented.
- Include or update tests when adding features or fixing bugs.

## Running Tests

Use the commands below to verify your changes:

```bash
npm run lint          # Run ESLint
npx tsc --noEmit      # Type-check the project
npm test              # Execute unit tests
```

Please make sure these commands succeed before opening a pull request.
