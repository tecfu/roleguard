# Roleguard

A role based access control library with some unconventional options:

- Add a conditional validation constraint to an access rule (facilitates more specificitiy than packages that limit access to roles and their granted actions).

- Report which rule granted access.

## Install

```js
npm install https://github.com/tecfu/roleguard.git
```

### Example

```js
const RoleGuard = require('@tecfu/roleguard')
// or as ES6 module use
// import RoleGuard from '@tecfu/roleguard'

const AccessRules = {
  user: {
    can: [
      {
        resource: 'chat',
        actions: ['update'],
        condition: (ctx) => {
          // rule will only positive match if function returns boolean `true`
          return ctx.request.body.id === ctx.state.jwt.sub.id
        }
      }
    ]
  }
}

const abilities = RoleGuard(AccessRules)
const ctx = {
  request: {
    body: {
      id: 2
    }
  },
  state: {
    jwt: {
      sub: {
        id: 2
      }
    }
  }
}
const test = abilities.can('update', 'chat', ['user'], ctx)
console.log(test)

//{
//  can: true,
//  message: 'user can update chat subject to rule condition',
//  rule: {
//    resource: 'chat',
//    actions: [ 'update' ],
//    condition: '(ctx) => {\n' +
//      '          return ctx.request.body.id === ctx.state.jwt.sub.id\n' +
//      '        }'
//  },
//  roles: [ 'user' ],
//  requestedAction: 'update',
//  requestedResource: 'chat'
//}

```

## Test

```
npm run-script test
```

## License

GPL 3.0
