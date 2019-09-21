'use strict';

class Base {

  constructor (abilityMap) {
    this.abilityMap = abilityMap;
  }

  validate(requestedAction, requestedResource, availableRoles) {

    // parameter validation
    if (typeof requestedAction !== 'string') throw new Error("requestedAction must be a string")

    const acceptableActions = ['read','create','update','delete'];
    if (!(acceptableActions.includes(requestedAction))) throw new Error(`requestedResource must be ${acceptableActions.join(',')}`)

    if (typeof requestedResource !== 'string') {
      throw new Error(`requestedResource must be a string, instead received ${typeof requestedResource}`)
    }

    if (!(availableRoles instanceof Array)) {
      throw new Error(`availableRoles must be an array, instead received ${typeof availableRoles}`)
    }

  }

}

class VerboseMode extends Base {

  constructor (abilityMap) {
    super(abilityMap);
  }

  // this is an OR operation. one match returns true
  can (requestedAction, requestedResource, availableRoles, paramsForConditional) {

    this.validate(requestedAction, requestedResource, availableRoles);

    let result;

    // check if any role matches `cannot` rule
    for(let i in availableRoles){
      result = this.findMatch('cannot', availableRoles[i], requestedResource, requestedAction, paramsForConditional, availableRoles);
      // return early if rule matched
      if(result.can) {
        // invert the decision because we're testing `cannot`
        result.can = false;
        return result
      }
    }

    // check if any role matches `can` rule
    for(let i in availableRoles){
      result = this.findMatch('can', availableRoles[i], requestedResource, requestedAction, paramsForConditional, availableRoles);
      // return early if rule matched
      if(result.can) {
        return result
      }
    }

    return result

  }

  findMatch (ability, role, requestedResource, requestedAction, paramsForConditional, availableRoles) {

    const request = `${role} ${ability} ${requestedAction} ${requestedResource}`;

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
        };

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
      });

    // match found
    if (output !== undefined) {
      result.can = true;
      result.message = (output.hasOwnProperty('condition')) ? `${request} subject to rule condition` : request;
      result.rule = {};
      result.rule[ability] = output;
      if(output.hasOwnProperty('condition')) result.rule[ability].condition = `${output.condition.toString()}`;
    }

    return result
  }

}

class BooleanMode extends Base {

  constructor (abilityMap) {
    super(abilityMap);
  }

  can (requestedAction, requestedResource, availableRoles, paramsForConditional) {

    this.validate(requestedAction, requestedResource, availableRoles);

    // check if any role cannot
    const cannot = availableRoles
      .some((role) => {
        return this.findMatch('cannot', role, requestedResource, requestedAction, paramsForConditional)
      });

    if (cannot) {
      return false
    }

    // check if any role can
    const can = availableRoles
      .some((role) => {
        return this.findMatch('can', role, requestedResource, requestedAction, paramsForConditional)
      });

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
      });

    return (out && out.length && out.length > 0)
  }

}

const Factory = (abilityMap, preferred) => {

  return (preferred && preferred === 'boolean') ? new BooleanMode (abilityMap) : new VerboseMode (abilityMap)

};

module.exports = Factory;
