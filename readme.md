# Jain Atlas
Jain Atlas is a monorepo for the Jain Atlas project, which includes various applications and utilities.

## Development Setup

You will need to install Bun to run the project. Follow the instructions on the [Bun website](https://bun.sh/docs/installation) to install it.

## Folder Structure
- `apps/`: Contains the main applications of the Jain Atlas project.
  - `apps/backend/`: API using Hono framework.
  - `apps/web/`: Frontend application using Vue, Vite, Tailwind.

- `packages/`: Contains shared packages and utilities used by the applications.
  - `packages/utils/`: Shared utilities and constants.
  - `packages/types/`: Type definitions used across the project.
