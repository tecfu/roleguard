import Base, { type Action } from "./base.ts"

export default class BooleanMode<Context = unknown> extends Base<Context> {
  can(requestedAction: Action, requestedResource: string, availableRoles: string[], context: Context): boolean {
    this.validate(requestedAction, requestedResource, availableRoles)
    for (const role of availableRoles) {
      const rules = this.getRules(role, "cannot")
      if (rules?.some((rule) => this.matchesRule(rule, requestedResource, requestedAction, context))) return false
    }
    for (const role of availableRoles) {
      const rules = this.getRules(role, "can")
      if (rules?.some((rule) => this.matchesRule(rule, requestedResource, requestedAction, context))) return true
    }
    return false
  }
}
