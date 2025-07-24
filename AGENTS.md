# AGENTS.md — Automation & Bot Reference

| Agent / Workflow             | Purpose                                                | Triggers                                    | Key Commands               |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------- | -------------------------- |
| **Codex (ChatGPT)**          | Applies “/talk-to-codex” patches, runs CI-safe scripts | PR comments containing code-fenced commands | `/codex run <script-name>` |
| **Asset-Check Action**       | Fails CI when required SVG/Lottie assets are missing   | `push` / `pull_request`                     | —                          |
| **Expo–EAS Build GH Action** | Kicks off preview builds on `main` tag                 | Tag like `v*.*.*`                           | —                          |

"postCreateCommand": "./setup.sh"
