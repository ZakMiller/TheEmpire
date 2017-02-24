'use strict'

const {
  socket
} = require('./shared')
const loginHandler = require('./loginHandler')
const gameHandler = require('./gameHandler')

// Initialize StateManager
const stateManager = require('./stateManager')
socket.on('stateChange', changeState)

function changeState(stateName) {
  stateManager.changeTo(stateName)
}

// Login State
stateManager.register('login', loginHandler)

// Game State
stateManager.register('game', gameHandler)
