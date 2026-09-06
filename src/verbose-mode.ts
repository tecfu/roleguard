import Base, { type Ability, type Action, type Decision, type Rule } from "./base.js"

export default class VerboseMode<Context = unknown> extends Base<Context> {
  can(requestedAction: Action, requestedResource: string, availableRoles: string[], context: Context): Decision<Context> {
    this.validate(requestedAction, requestedResource, availableRoles)

    const denied = this.findMatch("cannot", requestedAction, requestedResource, availableRoles, context)
    if (denied) return this.createDecision(false, "cannot", denied.role, denied.rule, requestedAction, requestedResource, availableRoles)

    const granted = this.findMatch("can", requestedAction, requestedResource, availableRoles, context)
    if (granted) return this.createDecision(true, "can", granted.role, granted.rule, requestedAction, requestedResource, availableRoles)

    return {
      can: false,
      message: `not authorized to ${requestedAction} ${requestedResource}`,
      rule: null,
      roles: availableRoles,
      requestedAction,
      requestedResource
    }
  }

  private findMatch(ability: Ability, requestedAction: Action, requestedResource: string, roles: string[], context: Context): { role: string; rule: Rule<Context> } | null {
    for (const role of roles) {
      const rules = this.getRules(role, ability)
      if (!rules) continue
      for (const rule of rules) {
        if (this.matchesRule(rule, requestedResource, requestedAction, context)) return { role, rule }
      }
    }
    return null
  }

  private createDecision(can: boolean, ability: Ability, role: string, matchedRule: Rule<Context>, requestedAction: Action, requestedResource: string, roles: string[]): Decision<Context> {
    const rule = { ...matchedRule }
    const hasCondition = Object.prototype.hasOwnProperty.call(matchedRule, "condition")
    if (hasCondition && typeof rule.condition === "function") {
      rule.condition = rule.condition.toString() as unknown as Rule<Context>["condition"]
    }

    return {
      can,
      message: hasCondition
        ? `${role} ${ability} ${requestedAction} ${requestedResource} subject to rule condition`
        : `${role} ${ability} ${requestedAction} ${requestedResource}`,
      rule: { [ability]: rule } as Record<Ability, Rule<Context>>,
      roles,
      requestedAction,
      requestedResource
    }
  }
}
