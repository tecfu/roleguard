"use strict"

const test = require("node:test")
const assert = require("node:assert/strict")
const RoleGuard = require("../dist/cjs.js")

const abilityMap = {
  user: {
    can: [
      { resource: "video", actions: ["read"] },
      {
        resource: "video",
        actions: ["update", "create", "delete"],
        condition: (ctx) => ctx.request.body.id === ctx.state.jwt.sub.id
      }
    ]
  },
  banned: {
    cannot: [{ resource: "video", actions: ["read"] }]
  },
  subscriber: {
    can: [{ resource: "video", actions: ["read"] }]
  },
  promo66: {
    can: [{ resource: "promo66", actions: ["read"] }]
  }
}

test("verbose mode authorizes a matching rule", () => {
  const guard = RoleGuard(abilityMap)
  const result = guard.can("read", "video", ["subscriber"], {})

  assert.equal(result.can, true)
  assert.equal(result.message, "subscriber can read video")
  assert.deepEqual(result.rule.can, abilityMap.subscriber.can[0])
})

test("explicit cannot rules take precedence", () => {
  const guard = RoleGuard(abilityMap)
  const result = guard.can("read", "video", ["subscriber", "banned"], {})

  assert.equal(result.can, false)
  assert.equal(result.message, "banned cannot read video")
})

test("conditional rules grant only when the condition matches", () => {
  const guard = RoleGuard(abilityMap)
  const denied = guard.can("update", "video", ["user"], {
    request: { body: { id: 2 } },
    state: { jwt: { sub: { id: 3 } } }
  })
  const allowed = guard.can("update", "video", ["user"], {
    request: { body: { id: 2 } },
    state: { jwt: { sub: { id: 2 } } }
  })

  assert.equal(denied.can, false)
  assert.equal(allowed.can, true)
  assert.match(allowed.message, /subject to rule condition$/)
})

test("verbose results do not mutate the original rule", () => {
  const condition = abilityMap.user.can[1].condition
  const guard = RoleGuard(abilityMap)

  const result = guard.can("update", "video", ["user"], {
    request: { body: { id: 2 } },
    state: { jwt: { sub: { id: 2 } } }
  })

  assert.equal(typeof abilityMap.user.can[1].condition, "function")
  assert.equal(abilityMap.user.can[1].condition, condition)
  assert.equal(typeof result.rule.can.condition, "string")
})

test("boolean mode returns only the authorization decision", () => {
  const guard = RoleGuard(abilityMap, "boolean")

  assert.equal(guard.can("read", "video", ["subscriber"], {}), true)
  assert.equal(guard.can("read", "video", ["banned"], {}), false)
  assert.equal(guard.can("read", "promo66", ["subscriber"], {}), false)
})

test("unknown and inherited role names cannot authorize access", () => {
  const guard = RoleGuard(abilityMap)

  assert.equal(guard.can("read", "video", ["missing", "toString"], {}), false)
})

test("throwing conditions fail closed", () => {
  const guard = RoleGuard({
    user: {
      can: [{ resource: "secret", actions: ["read"], condition: () => { throw new Error("boom") } }]
    }
  })

  assert.equal(guard.can("read", "secret", ["user"], {}), false)
})

test("invalid requests are rejected", () => {
  const guard = RoleGuard(abilityMap)

  assert.throws(() => guard.can("list", "video", ["user"], {}), /requestedAction/)
  assert.throws(() => guard.can("read", 42, ["user"], {}), /requestedResource/)
  assert.throws(() => guard.can("read", "video", "user", {}), /availableRoles/)
  assert.throws(() => RoleGuard(null), /abilityMap/)
})
