import VerboseMode from './verbose-mode.js'
import BooleanMode from './boolean-mode.js'

const Factory = (abilityMap, preferred) => {

  return (preferred && preferred === 'boolean') ? new BooleanMode (abilityMap) : new VerboseMode (abilityMap)

}

export default Factory
