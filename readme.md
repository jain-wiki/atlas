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
1. <kbd>Ctrl+Shift+B</kbd> To start the local host development server

## Folder Structure
- `apps/`: Contains the main applications of the Jain Atlas project.
  - `apps/backend/`: API using Hono framework.
  - `apps/web/`: Frontend application using Vue, Vite, Tailwind.

- `packages/`: Contains shared packages and utilities used by the applications.
  - `packages/utils/`: Shared utilities and constants.
  - `packages/types/`: Type definitions used across the project.

## SPARQL Queries
When using SPARQL queries, use the following prefixes:
```sql
PREFIX yq: <https://data.jain.wiki/entity/>
PREFIX yp: <https://data.jain.wiki/prop/direct/>

```

Get List of last modified items
```sql
SELECT ?item ?itemLabel ?typeofLabel ?modified WHERE {
  ?item schema:dateModified ?modified.
  OPTIONAL {?item yp:P1 ?typeof.}
  BIND(NOW() - ?modified AS ?date_range)
  FILTER(?date_range <= 30)  # Items modified in the last 30 days (adjust to <=7 for a week, etc.)
  # MINUS { ?item yp:P1 ?typeof. } # Filter items where instance of (ie P1) is not set.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
}
ORDER BY DESC(?modified)
LIMIT 100
```

## Special Pages

- https://data.jain.wiki/wiki/Special:Log/delete
- https://data.jain.wiki/wiki/Special:EntityData/Q12.json (JSON representation of the entity)
- https://data.jain.wiki/w/api.php?action=parse&page=Property%20talk:P36&format=json&prop=wikitext (JSON of Discussion page)
- https://data.jain.wiki/wiki/Special:Log/protect Logs of protection changes
- https://data.jain.wiki/wiki/Special:ListUsers List of users
