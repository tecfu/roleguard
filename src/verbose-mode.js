import Base from './base.js'

class VerboseMode extends Base {

  constructor (abilityMap) {
    super(abilityMap)
  }

  // this is an OR operation. one match returns true
  can (requestedAction, requestedResource, availableRoles, paramsForConditional) {

    this.validate(requestedAction, requestedResource, availableRoles)

    let result

    // check if any role matches `cannot` rule
    for(let i in availableRoles){
      result = this.findMatch('cannot', availableRoles[i], requestedResource, requestedAction, paramsForConditional, availableRoles)
      // return early if rule matched
      if(result.can) {
        // invert the decision because we're testing `cannot`
        result.can = false
        return result
      }
    }

    // check if any role matches `can` rule
    for(let i in availableRoles){
      result = this.findMatch('can', availableRoles[i], requestedResource, requestedAction, paramsForConditional, availableRoles)
      // return early if rule matched
      if(result.can) {
        return result
      }
    }

    return result

  }

  findMatch (ability, role, requestedResource, requestedAction, paramsForConditional, availableRoles) {

    const request = `${role} ${ability} ${requestedAction} ${requestedResource}`

    let can = false,
        rule = null,
        message = `not authorized to ${requestedAction} ${requestedResource}`,
        result = {
          can,
          message,
          rule,
          roles: availableRoles,
          requestedAction,
          requestedResource
        }

    // return false if role doesn't exist
    if(!(this.abilityMap.hasOwnProperty(role))) return result
    if(!(this.abilityMap[role].hasOwnProperty(ability))) return result

    const output = this.abilityMap[role][ability]
      // return all rules where resource property matches
      .filter((obj) => {
        return obj.hasOwnProperty('resource') 
          && obj.resource === requestedResource
      })
      // return all rules where action property matches
      .filter((obj) => {
        return obj.hasOwnProperty('actions') 
          && obj.actions.includes(requestedAction)
      })
      // return first matching rule without condition property 
      // or first matching rule where condition property evaluates to true
      .find((obj) => {
        
        // if no condition property, we have a match
        if(!(obj.hasOwnProperty('condition'))) return true

        // validate condition property value is function
        if(typeof obj.condition !== 'function') throw new Error(`rule condition value must be a function, ${JSON.stringify(obj)}`)

        // if condition returns true, we have a match
        try {
          if(obj.condition(paramsForConditional)) return true
        }
        catch(err) {
          return false
        }
      })

    // match found
    if (output !== undefined) {
      result.can = true
      result.message = (output.hasOwnProperty('condition')) ? `${request} subject to rule condition` : request
      result.rule = {}
      result.rule[ability] = output
      if(output.hasOwnProperty('condition')) result.rule[ability].condition = `${output.condition.toString()}`
    }

    return result
  }

}

export default VerboseMode
