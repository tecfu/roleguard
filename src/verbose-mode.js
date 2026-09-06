const Base = require("./base.js")

class VerboseMode extends Base {
  can(requestedAction, requestedResource, availableRoles, paramsForConditional) {
    this.validate(requestedAction, requestedResource, availableRoles)

    let result = this.createResult(requestedAction, requestedResource, availableRoles)

    // Explicit deny always wins, then the first positive rule grants access.
    for (const role of availableRoles) {
      const match = this.findMatch(
        "cannot",
        role,
        requestedResource,
        requestedAction,
        paramsForConditional,
        availableRoles
      )

      if (match) {
        return this.createMatchResult(
          false,
          role,
          "cannot",
          match,
          requestedAction,
          requestedResource,
          availableRoles
        )
      }
    }

    for (const role of availableRoles) {
      const match = this.findMatch(
        "can",
        role,
        requestedResource,
        requestedAction,
        paramsForConditional,
        availableRoles
      )

      if (match) {
        return this.createMatchResult(
          true,
          role,
          "can",
          match,
          requestedAction,
          requestedResource,
          availableRoles
        )
      }
    }

    return result
  }

  createResult(requestedAction, requestedResource, availableRoles) {
    return {
      can: false,
      message: `not authorized to ${requestedAction} ${requestedResource}`,
      rule: null,
      roles: availableRoles,
      requestedAction,
      requestedResource
    }
  }

  createMatchResult(can, role, ability, rule, requestedAction, requestedResource, availableRoles) {
    const request = `${role} ${ability} ${requestedAction} ${requestedResource}`
    const matchedRule = { ...rule }

    if (Object.prototype.hasOwnProperty.call(matchedRule, "condition")) {
      matchedRule.condition = matchedRule.condition.toString()
    }

    return {
      can,
      message: Object.prototype.hasOwnProperty.call(rule, "condition")
        ? `${request} subject to rule condition`
        : request,
      rule: { [ability]: matchedRule },
      roles: availableRoles,
      requestedAction,
      requestedResource
    }
  }

  findMatch(ability, role, requestedResource, requestedAction, paramsForConditional) {
    const rules = this.getRules(role, ability)
    if (!rules) return null

    for (const rule of rules) {
      if (this.matchesRule(rule, requestedResource, requestedAction, paramsForConditional)) {
        return rule
      }
    }

    return null
  }
}

module.exports = VerboseMode
