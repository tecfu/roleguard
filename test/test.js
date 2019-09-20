'use strict';

const fs = require('fs') 
const filepath = __dirname+'/test-output.json';
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
const should = chai.should()
const RoleGuard = require(__dirname+'/../dist/cjs.js')
let testOutput = []

const AbilityMap = {
  user: {
    can: [
      { resource: 'video', actions: ['read'] },
      {
        resource: 'video',
        actions: ['update', 'create', 'delete'],
        condition: (ctx) => {
          return ctx.request.body.id === ctx.state.jwt.sub.id
        }
      }
    ]
  },
  banned: {
    cannot: [
      { resource: 'video', actions: ['read'] }
    ]
  },
  subscriber: {
    can: [
      { resource: 'video', actions: ['read'] }
    ]
  },
  promo66: {
    can: [
      { resource: 'promo66', actions: ['read'] }
    ]
  }
}

const verboseMode = RoleGuard(AbilityMap)

const ctx = {
  request: {
    body: {
      id: 2
    }
  },
  state: {
    jwt: {
      sub: {
        id: 3
      }
    },
    user: {
      id: 3,
      roles: ['user']
    },
    meta: {
      action: "update",
      resource: "user"
    }
  }
}
const tests = [ 
  {
    resource: 'video',
    action: 'read',
    roles: ['public'],
    data: {}
  },
  {
    resource: 'video',
    action: 'read',
    roles: ['subscriber'],
    data: {}
  },
  {
    resource: 'video',
    action: 'update',
    roles: ['user'],
    data: {
      request: {
        body: {
          id: 2
        }
      },
      state: {
        jwt: {
          sub: {
            id: 3
          }
        }
      }
    }
  },
  {
    resource: 'video',
    action: 'update',
    roles: ['user'],
    data: {
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
  },
  {
    resource: 'video',
    action: 'read',
    roles: ['user', 'subscriber', 'banned'],
    data: {}
  },
  {
    resource: 'promo66',
    action: 'read',
    roles: ['user', 'subscriber', 'banned'],
    data: {}
  },
  {
    resource: 'promo66',
    action: 'read',
    roles: ['promo66'],
    data: {}
  }


].forEach( (obj, i) => {

  const { action, resource, roles, data, expected } = obj
  const result = verboseMode.can(action, resource, roles, data)

  switch(true){
    case(process.argv[2] && process.argv[2] === '--save'):
    //save test result
      testOutput.push(result)
      break;
    case(process.argv[2] && process.argv[2] === '--display'):
    //show test results (do nothing)
      console.log(result)
      break;
    default:
    //run tests
      //get saved test results
      let expected = require(filepath);
      describe(`${action} ${resource} trying role(s): ${roles.join(',')}`,function(){
        it(`Expected '${expected[i].can}', '${expected[i].message}' and received '${result.can}', '${result.message}'`,function(){
          expect(result).to.eql(expected[i]);
        })
      })
  }
})

if(process.argv[2] && process.argv[2] === '--save'){
  //write saved object to file
  fs.writeFileSync(filepath,JSON.stringify(testOutput,null,2),'utf8');
  console.log("Tests saved to file.");
}
