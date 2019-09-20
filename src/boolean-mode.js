import Base from './base.js'

class BooleanMode extends Base {

  constructor (abilityMap) {
    super(abilityMap)
  }

  can (requestedAction, requestedResource, availableRoles, paramsForConditional) {

    this.validate(requestedAction, requestedResource, availableRoles)

    // check if any role cannot
    const cannot = availableRoles
      .some((role) => {
        return this.findMatch('cannot', role, requestedResource, requestedAction, paramsForConditional)
      })

    if (cannot) {
      return false
    }

    // check if any role can
    const can = availableRoles
      .some((role) => {
        return this.findMatch('can', role, requestedResource, requestedAction, paramsForConditional)
      })

    return can
  }

  findMatch (ability, role, requestedResource, requestedAction, paramsForConditional) {

    // return false if role doesn't exist
    if(!(this.abilityMap.hasOwnProperty(role))) return false
    if(!(this.abilityMap[role].hasOwnProperty(ability))) return false

    const out = this.abilityMap[role][ability]
      // filter abilities where resource matches
      .filter( (obj) => {
        return obj.hasOwnProperty('resource') 
          && obj.resource === requestedResource
      })
      // filter resources where action matches
      .filter( (obj) => {
        return obj.hasOwnProperty('actions') 
          && obj.actions.includes(requestedAction)
      })
      // filter no condition or condition returns true
      .filter( (obj) =>{
        
        if(!(obj.hasOwnProperty('condition'))) return true

        // validate condition is function
        if(typeof obj.condition !== 'function') throw new Error(`rule condition value must be a function, ${JSON.stringify(obj)}`)

        try {
          return obj.condition(paramsForConditional)
        }
        catch (err) {
          return false
        }
      })

    return (out && out.length && out.length > 0)
  }

}

export default BooleanMode
