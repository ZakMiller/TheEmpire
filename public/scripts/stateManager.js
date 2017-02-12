'use strict'

const stateMap = {}
let currentStateName

module.exports = {
  // register new state with the provided onEnter and onExit callbacks,
  // if they're given
  // onEnter and onExit default to an empty function if undefined
  register(name, {
    onEnter = () => {},
    onExit = () => {}
  }) {
    if (stateMap[name]) {
      return false
    }
    stateMap[name] = {
      onEnter,
      onExit
    }

    return true
  },

  changeTo(name) {
    const newState = stateMap[name]

    if (!newState) {
      return false
    }

    if (currentStateName) { // will be undefined the 1st time
      stateMap[currentStateName].onExit()
    }
    newState.onEnter()
    currentStateName = name
  }
}
