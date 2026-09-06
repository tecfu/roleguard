import RoleGuard, { type AbilityMap } from "../src/main.js"

type Context = { userId: number }

const accessRules: AbilityMap<Context> = {
  user: {
    can: [{ resource: "chat", actions: ["update"], condition: (ctx) => ctx.userId === 42 }]
  }
}

const result = RoleGuard(accessRules).can("update", "chat", ["user"], { userId: 42 })
console.log(result)
