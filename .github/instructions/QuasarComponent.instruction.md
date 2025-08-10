---
applyTo: '**/*.vue'
---
1. Use Quasar's component library wherever possible instead of writing custom components/ HTML.
2. Use minimal markup, CSS. Instead of using Quasar css classes, use tailwind classes (with `tw:` prefix) to style the components.
3. Use PascalCase for component names, including the Quasar components. Example: `QPage` instead of `q-page`.
4. When calling API, use `Ax` axios instance which is defined in `src/helper/axios.ts` file.