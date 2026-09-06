class Base {
  constructor(abilityMap) {
    if (!abilityMap || typeof abilityMap !== "object" || Array.isArray(abilityMap)) {
      throw new TypeError("abilityMap must be an object")
    }

    this.abilityMap = abilityMap
  }

  validate(requestedAction, requestedResource, availableRoles) {
    if (typeof requestedAction !== "string") {
      throw new TypeError("requestedAction must be a string")
    }

    const acceptableActions = ["read", "create", "update", "delete"]
    if (!acceptableActions.includes(requestedAction)) {
      throw new Error(`requestedAction must be ${acceptableActions.join(",")}`)
    }

    if (typeof requestedResource !== "string") {
      throw new TypeError(`requestedResource must be a string, instead received ${typeof requestedResource}`)
    }

    if (!Array.isArray(availableRoles)) {
      throw new TypeError(`availableRoles must be an array, instead received ${typeof availableRoles}`)
    }
  }

  getRules(role, ability) {
    if (!Object.prototype.hasOwnProperty.call(this.abilityMap, role)) return null

    const roleRules = this.abilityMap[role]
    if (!roleRules || typeof roleRules !== "object") return null
    if (!Object.prototype.hasOwnProperty.call(roleRules, ability)) return null

    const rules = roleRules[ability]
    return Array.isArray(rules) ? rules : null
  }

  matchesRule(rule, requestedResource, requestedAction, paramsForConditional) {
    if (!rule || typeof rule !== "object") return false
    if (rule.resource !== requestedResource) return false
    if (!Array.isArray(rule.actions) || !rule.actions.includes(requestedAction)) return false
    if (!Object.prototype.hasOwnProperty.call(rule, "condition")) return true

    if (typeof rule.condition !== "function") {
      throw new TypeError(`rule condition value must be a function, ${JSON.stringify(rule)}`)
    }

    try {
      return Boolean(rule.condition(paramsForConditional))
    } catch {
      // Conditions fail closed: a broken condition must never grant access.
      return false
    }
  }
}

module.exports = Base
