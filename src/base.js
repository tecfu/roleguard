class Base {

  constructor (abilityMap) {
    this.abilityMap = abilityMap
  }

  validate(requestedAction, requestedResource, availableRoles) {

    // parameter validation
    if (typeof requestedAction !== 'string') throw new Error("requestedAction must be a string")

    const acceptableActions = ['read','create','update','delete']
    if (!(acceptableActions.includes(requestedAction))) throw new Error(`requestedResource must be ${acceptableActions.join(',')}`)

    if (typeof requestedResource !== 'string') {
      throw new Error(`requestedResource must be a string, instead received ${typeof requestedResource}`)
    }

    if (!(availableRoles instanceof Array)) {
      throw new Error(`availableRoles must be an array, instead received ${typeof availableRoles}`)
    }

  }

}

export default Base
