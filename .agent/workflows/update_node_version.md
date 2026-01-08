---
description: How to safely update the Node.js version across all project files
---
# Update Node.js Version

When updating the Node.js version for the project, you must ensure consistency across the following files:

1.  **Environment Configuration (`.nvmrc`)**
    - Update the version string (e.g., `v24.12.0`).

2.  **Package Manifest (`package.json`)**
    - Update the `engines.node` field to match (e.g., `>=24.12.0`).

3.  **Docker Environment (`docker/Dockerfile`)**
    - Update the `FROM` instruction to the corresponding Node image tag (e.g., `FROM node:24-bullseye-slim`).

4.  **GitHub Workflows (`.github/workflows/*.yaml`)**
    - Update the `node-version` input for the `actions/setup-node` step in all workflow files (e.g., `node-version: 24`).

## Example Checklist
- [ ] Update `.nvmrc`
- [ ] Update `package.json` engines
- [ ] Update `docker/Dockerfile` base image
- [ ] Update `.github/workflows/build-main.yaml`
- [ ] Update `.github/workflows/build-pr.yaml`
