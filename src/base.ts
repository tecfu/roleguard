export type Action = "read" | "create" | "update" | "delete"
export type Ability = "can" | "cannot"
export type Condition<Context = unknown> = (context: Context) => unknown

export interface Rule<Context = unknown> {
  resource: string
  actions: Action[]
  condition?: Condition<Context>
}

export interface RoleRules<Context = unknown> {
  can?: Rule<Context>[]
  cannot?: Rule<Context>[]
}

export type AbilityMap<Context = unknown> = Record<string, RoleRules<Context>>

export interface Decision<Context = unknown> {
  can: boolean
  message: string
  rule: Record<Ability, Rule<Context>> | null
  roles: string[]
  requestedAction: Action
  requestedResource: string
}

export default class Base<Context = unknown> {
  protected readonly abilityMap: AbilityMap<Context>

  constructor(abilityMap: AbilityMap<Context>) {
    if (!abilityMap || typeof abilityMap !== "object" || Array.isArray(abilityMap)) throw new TypeError("abilityMap must be an object")
    this.abilityMap = abilityMap
  }

  protected validate(requestedAction: string, requestedResource: string, availableRoles: unknown): asserts availableRoles is string[] {
    if (typeof requestedAction !== "string") throw new TypeError("requestedAction must be a string")
    const acceptableActions: Action[] = ["read", "create", "update", "delete"]
    if (!acceptableActions.includes(requestedAction as Action)) throw new Error(`requestedAction must be ${acceptableActions.join(",")}`)
    if (typeof requestedResource !== "string") throw new TypeError(`requestedResource must be a string, instead received ${typeof requestedResource}`)
    if (!Array.isArray(availableRoles) || !availableRoles.every((role) => typeof role === "string")) throw new TypeError("availableRoles must be an array of strings")
  }

  protected getRules(role: string, ability: Ability): Rule<Context>[] | null {
    if (!Object.prototype.hasOwnProperty.call(this.abilityMap, role)) return null
    const roleRules = this.abilityMap[role]
    if (!roleRules || typeof roleRules !== "object") return null
    const rules = roleRules[ability]
    return Array.isArray(rules) ? rules : null
  }

  protected matchesRule(rule: Rule<Context>, requestedResource: string, requestedAction: Action, context: Context): boolean {
    if (!rule || typeof rule !== "object" || rule.resource !== requestedResource) return false
    if (!Array.isArray(rule.actions) || !rule.actions.includes(requestedAction)) return false
    if (!Object.prototype.hasOwnProperty.call(rule, "condition")) return true
    if (typeof rule.condition !== "function") throw new TypeError(`rule condition value must be a function, ${JSON.stringify(rule)}`)
    try { return Boolean(rule.condition(context)) } catch { return false }
  }
}
