# RoleGuard

A dependency-free, TypeScript-first role-based access control library with conditional rules and explanatory authorization decisions.

## Features

- Role-based `can` and `cannot` rules.
- Explicit deny rules take precedence over grants.
- Conditional rules for resource-specific authorization.
- Verbose decisions that identify the matching rule.
- Boolean mode for callers that only need `true` or `false`.
- Strict TypeScript types with generated declaration files.
- No runtime dependencies.

## Install

```sh
npm install @tecfu/roleguard
```

Node.js 22.18+ is required. Node 22.18 introduced built-in TypeScript type stripping, which this project uses for its test suite.

## Usage

```ts
import RoleGuard from "@tecfu/roleguard"
import type { AbilityMap } from "@tecfu/roleguard"

type Context = { userId: number }

const accessRules: AbilityMap<Context> = {
  user: {
    can: [
      {
        resource: "chat",
        actions: ["update"],
        condition: (ctx) => ctx.userId === 42
      }
    ]
  },
  banned: {
    cannot: [{ resource: "chat", actions: ["update"] }]
  }
}

const guard = RoleGuard(accessRules)
const result = guard.can("update", "chat", ["user"], { userId: 42 })

console.log(result.can)     // true
console.log(result.message) // user can update chat subject to rule condition
```

### Boolean mode

```ts
const guard = RoleGuard(accessRules, "boolean")
const allowed = guard.can("update", "chat", ["user"], { userId: 42 })
```

### Rule format

Each role may define `can` and/or `cannot` arrays. A rule has:

- `resource`: resource name.
- `actions`: one or more of `read`, `create`, `update`, or `delete`.
- `condition`: optional function receiving the caller-supplied context.

Conditions fail closed when they throw. Invalid condition values are rejected rather than treated as authorization grants.

## Development

```sh
npm install
npm test
npm run build
```

The build emits JavaScript and `.d.ts` declarations into `dist/`. TypeScript source lives entirely under `src/` and `test/`; no hand-written JavaScript is required.

## License

GPL-3.0-only
