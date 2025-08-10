# Jain Atlas
Jain Atlas is a main (monorepo) for the Jain Atlas project, which includes various applications and utilities.

## About Jain Atlas Project
The Jain Atlas project is to create a comprehensive platform for Jain Places, including an API and a web application. The project aims to provide easy access to information for the Jain community to build upon.
The current scope is limited to India, Nepal, Bhutan, and Sri Lanka. It can be extended to other countries in the future.

Types of Jain Places:
- `T` Temples
- `H` Hospitals
- `S` Schools
- `L` Libraries
- `C` Community Centers (Samaj Bhavans)
- `B` Dining Halls (Bhojanshalas)


## Development Setup

You will need to install Bun to run the project. Follow the instructions on the [Bun website](https://bun.sh/docs/installation) to install it.

## Folder Structure
- `apps/`: Contains the main applications of the Jain Atlas project.
  - `apps/backend/`: API using Hono framework.
  - `apps/web/`: Frontend application using Vue, Vite, Tailwind.

- `packages/`: Contains shared packages and utilities used by the applications.
  - `packages/utils/`: Shared utilities and constants.
  - `packages/types/`: Type definitions used across the project.

## SPARQL Queries
When using SPARQL queries, use the following prefixes:
```
PREFIX yq: <https://data.jain.wiki/entity/>
PREFIX yp: <https://data.jain.wiki/prop/direct/>

```

