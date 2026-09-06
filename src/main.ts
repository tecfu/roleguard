import BooleanMode from "./boolean-mode.js"
import VerboseMode from "./verbose-mode.js"
import type { AbilityMap } from "./base.js"

export type { AbilityMap, Action, Ability, Condition, Rule, RoleRules, Decision } from "./base.js"

export type Guard<Context = unknown> = BooleanMode<Context> | VerboseMode<Context>

export default function RoleGuard<Context = unknown>(abilityMap: AbilityMap<Context>, preferred?: "boolean"): Guard<Context> {
  return preferred === "boolean" ? new BooleanMode(abilityMap) : new VerboseMode(abilityMap)
}
