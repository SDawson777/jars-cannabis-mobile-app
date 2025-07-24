# Agent for Jars Cannabis Mobile App

## Goal

The primary goal of this agent is to maintain the project repository, ensure all dependencies are correctly installed, and verify that the code passes linting and TypeScript checks.

---

## Setup

The following commands must be run to set up the development environment.

### 1. Make Setup Script Executable

```bash
chmod +x setup.sh
```

### 2. Run Setup Script

```bash
./setup.sh
```

### 3. Test Commands

```bash
npm run lint
npx tsc --noEmit
```

## Google Cloud service account setup

Copy the following fields from the JSON below into `backend/.env`:
`GC_PROJECT_ID`, `GC_CLIENT_EMAIL`, and `GC_PRIVATE_KEY`.

```json
{
  "type": "service_account",
  "project_id": "modified-antler-466907-s5",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "jars-firebase-admin@modified-antler-466907-s5.iam.gserviceaccount.com"
}
```
