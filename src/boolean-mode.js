const Base = require("./base.js")

class BooleanMode extends Base {
  can(requestedAction, requestedResource, availableRoles, paramsForConditional) {
    this.validate(requestedAction, requestedResource, availableRoles)

    // Explicit deny always wins, then the first positive rule grants access.
    for (const role of availableRoles) {
      const rules = this.getRules(role, "cannot")
      if (!rules) continue

      for (const rule of rules) {
        if (this.matchesRule(rule, requestedResource, requestedAction, paramsForConditional)) {
          return false
        }
      }
    }

    for (const role of availableRoles) {
      const rules = this.getRules(role, "can")
      if (!rules) continue

      for (const rule of rules) {
        if (this.matchesRule(rule, requestedResource, requestedAction, paramsForConditional)) {
          return true
        }
      }
    }

    return false
  }
}

module.exports = BooleanMode
