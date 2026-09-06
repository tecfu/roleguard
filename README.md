# RoleGuard

A dependency-free role-based access control library with conditional rules and explanatory authorization decisions.

## Features

- Role-based `can` and `cannot` rules.
- Explicit deny rules take precedence over grants.
- Conditional rules for resource-specific authorization.
- Verbose decisions that identify the matching rule.
- Boolean mode for callers that only need `true` or `false`.
- No runtime dependencies.

## Install

```sh
npm install @tecfu/roleguard
```

Node.js 18.20 or newer is supported.

## Usage

```js
const RoleGuard = require("@tecfu/roleguard")

const accessRules = {
  user: {
    can: [
      {
        resource: "chat",
        actions: ["update"],
        condition: (ctx) => ctx.request.body.id === ctx.state.jwt.sub.id
      }
    ]
  },
  banned: {
    cannot: [
      { resource: "chat", actions: ["update"] }
    ]
  }
}

const guard = RoleGuard(accessRules)

const result = guard.can("update", "chat", ["user"], {
  request: { body: { id: 2 } },
  state: { jwt: { sub: { id: 2 } } }
})

console.log(result.can)     // true
console.log(result.message) // user can update chat subject to rule condition
```

The verbose result includes the matched rule, the supplied roles, and the requested action/resource. Conditional functions are represented as strings in the returned `rule` object; the original access-rule definition is never modified.

### Boolean mode

Use boolean mode when the decision details are not needed:

```js
const guard = RoleGuard(accessRules, "boolean")
const allowed = guard.can("update", "chat", ["user"], context)
```

## Rule format

Each role may define `can` and/or `cannot` arrays. A rule has:

- `resource`: resource name.
- `actions`: one or more of `read`, `create`, `update`, or `delete`.
- `condition`: optional function receiving the caller-supplied context.

Conditions fail closed when they throw. Invalid condition values are rejected rather than treated as authorization grants.

## Testing

```sh
npm test
```

## License

GPL-3.0-only
