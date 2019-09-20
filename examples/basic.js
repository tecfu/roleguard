const RoleGuard = require(__dirname+'/dist/cjs.js');

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
