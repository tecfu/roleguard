# Roleguard

A role based acess control library that includes some extra features I couldn't find elsewhere:

- Add a conditional validation constraint, to an access rule
- See which rule resulted in a positive match

## Install

```js
npm install https://github.com/tecfu/roleguard.git
```

### Usage

```js
const RoleGuard = require('@tecfu/roleguard')
// or as ES6 module use
// import RoleGuard from '@tecfu/roleguard'
const AbilityMap = {
  user: {
    can: [
      { resource: 'chat', actions: ['read'] },
      {
        resource: 'chat',
        actions: ['update'],
        condition: (ctx) => {
          return ctx.request.body.id === ctx.state.jwt.sub.id
        }
      }
    ]
  }
}

const abilities = RoleGuard(AbilityMap)
const can = abilities.can('update', 'chat', ['user'], {
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
  })
console.log(can)

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
