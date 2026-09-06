import { test } from "node:test"
import assert from "node:assert/strict"
import RoleGuard, { type AbilityMap } from "../src/main.ts"

type Context = { request?: { body?: { id?: number } }; state?: { jwt?: { sub?: { id?: number } } } }

const abilityMap: AbilityMap<Context> = {
  user: { can: [
    { resource: "video", actions: ["read"] },
    { resource: "video", actions: ["update", "create", "delete"], condition: (ctx) => ctx.request?.body?.id === ctx.state?.jwt?.sub?.id }
  ] },
  banned: { cannot: [{ resource: "video", actions: ["read"] }] },
  subscriber: { can: [{ resource: "video", actions: ["read"] }] },
  promo66: { can: [{ resource: "promo66", actions: ["read"] }] }
}

test("verbose mode authorizes a matching rule", () => {
  const result = RoleGuard(abilityMap).can("read", "video", ["subscriber"], {})
  assert.equal(result.can, true)
  assert.equal(result.message, "subscriber can read video")
  assert.deepEqual(result.rule!.can!, abilityMap.subscriber!.can![0])
})

test("explicit cannot rules take precedence", () => {
  const result = RoleGuard(abilityMap).can("read", "video", ["subscriber", "banned"], {})
  assert.equal(result.can, false)
  assert.equal(result.message, "banned cannot read video")
})

test("conditional rules grant only when the condition matches", () => {
  const guard = RoleGuard(abilityMap)
  const denied = guard.can("update", "video", ["user"], { request: { body: { id: 2 } }, state: { jwt: { sub: { id: 3 } } } })
  const allowed = guard.can("update", "video", ["user"], { request: { body: { id: 2 } }, state: { jwt: { sub: { id: 2 } } } })
  assert.equal(denied.can, false)
  assert.equal(allowed.can, true)
  assert.match(allowed.message, /subject to rule condition$/)
})

test("verbose results do not mutate the original rule", () => {
  const condition = abilityMap.user!.can![1]!.condition
  const result = RoleGuard(abilityMap).can("update", "video", ["user"], { request: { body: { id: 2 } }, state: { jwt: { sub: { id: 2 } } } })
  assert.equal(abilityMap.user!.can![1]!.condition, condition)
  assert.equal(typeof result.rule!.can!.condition, "string")
})

test("boolean mode returns only the authorization decision", () => {
  const guard = RoleGuard(abilityMap, "boolean")
  assert.equal(guard.can("read", "video", ["subscriber"], {}), true)
  assert.equal(guard.can("read", "video", ["banned"], {}), false)
  assert.equal(guard.can("read", "promo66", ["subscriber"], {}), false)
})

test("unknown and inherited role names cannot authorize access", () => {
  assert.equal(RoleGuard(abilityMap).can("read", "video", ["missing", "toString"], {}).can, false)
  assert.equal(RoleGuard(abilityMap, "boolean").can("read", "video", ["missing", "toString"], {}), false)
})

test("throwing conditions fail closed", () => {
  const policy: AbilityMap = { user: { can: [{ resource: "secret", actions: ["read"], condition: () => { throw new Error("boom") } }] } }
  assert.equal(RoleGuard(policy).can("read", "secret", ["user"], {}).can, false)
  assert.equal(RoleGuard(policy, "boolean").can("read", "secret", ["user"], {}), false)
})

test("invalid requests are rejected", () => {
  const guard = RoleGuard(abilityMap)
  assert.throws(() => guard.can("list" as never, "video", ["user"], {}), /requestedAction/)
  assert.throws(() => guard.can("read", 42 as never, ["user"], {}), /requestedResource/)
  assert.throws(() => guard.can("read", "video", "user" as never, {}), /availableRoles/)
  assert.throws(() => RoleGuard(null as never), /abilityMap/)
})
