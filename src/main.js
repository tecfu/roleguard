const VerboseMode = require("./verbose-mode.js")
const BooleanMode = require("./boolean-mode.js")

const RoleGuard = (abilityMap, preferred) => {
  return preferred === "boolean"
    ? new BooleanMode(abilityMap)
    : new VerboseMode(abilityMap)
}

module.exports = RoleGuard
