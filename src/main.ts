import BooleanMode from "./boolean-mode.ts"
import VerboseMode from "./verbose-mode.ts"
import type { AbilityMap } from "./base.ts"

export type { AbilityMap, Action, Ability, Condition, Rule, RoleRules, Decision } from "./base.ts"

export function RoleGuard<Context = unknown>(abilityMap: AbilityMap<Context>): VerboseMode<Context>
export function RoleGuard<Context = unknown>(abilityMap: AbilityMap<Context>, preferred: "boolean"): BooleanMode<Context>
export default function RoleGuard<Context = unknown>(abilityMap: AbilityMap<Context>, preferred?: "boolean"): BooleanMode<Context> | VerboseMode<Context> {
  return preferred === "boolean" ? new BooleanMode(abilityMap) : new VerboseMode(abilityMap)
}
