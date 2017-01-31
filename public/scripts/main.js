'use strict'

const socket = require('socket.io-client')()

const ONE_SECOND = 1000

// Initialize StateManager
const stateManager = require('./stateManager')
socket.on('stateChange', changeState)

function changeState(stateName) {
  stateManager.changeTo(stateName)
}

// Shared Helper Functions
function enterKeyPressed(callback) {
  return function keyupEventListener(event) {
    event.preventDefault()
    const ENTER_KEY = 13
    if (event.keyCode === ENTER_KEY) {
      callback()
    }
  }
}

// Login State
const loginHandler = (function loginIIFE() {
  let username
  const nameInput = document.querySelector('#nameInput')
  const registration = document.querySelector('#registration')
  const lobby = document.querySelector('#lobby')
  const lobbyList = document.querySelector('#lobbyList')
  const countdownBanner = document.querySelector('#countdownBanner')

  let timeoutReference

  // Event Listeners
  function updateLobby(usernames) {
    lobbyList.innerHTML = ''
    usernames.forEach(name => {
      const listItem = document.createElement('li')
      const text = (username === name) ? `> ${name}` : name
      listItem.appendChild(document.createTextNode(text))
      lobbyList.appendChild(listItem)
    })
  }

  function register() {
    username = document.querySelector('#nameInput').value
    socket.emit('register', username, function handleRegisterError(err) {
      if (err) {
        alert(JSON.stringify(err)) // TODO: show error more elegantly
      } else {
        registration.hidden = true
        lobby.hidden = false
      }
    })
  }

  function countdown(delayInSeconds) {
    clearTimeout(timeoutReference)

    if (delayInSeconds > 0) { // if we still have some time to count down
      countdownBanner.innerText = `GAME WILL START IN ${delayInSeconds} SECONDS...`
      timeoutReference = setTimeout(() => {
        countdown(delayInSeconds - 1)
      }, ONE_SECOND)
    }
  }

  // Transitions
  function onEnter() {
    socket.on('lobbyUpdate', updateLobby)
    socket.on('countdown', countdown)
    registration.hidden = false
    nameInput.focus()
    nameInput.addEventListener('keyup', enterKeyPressed(register))
  }

  function onExit() {
    nameInput.removeEventListener('keyup', enterKeyPressed(register))
    nameInput.blur()
    socket.removeAllListeners('lobbyUpdate')
    socket.removeAllListeners('countdown')
    countdownBanner.hidden = true
  }

  return {
    onEnter,
    onExit
  }
})()

stateManager.register('login', loginHandler)

// Game State
const gameHandler = (function gameIIFE() {
  const errorSound = document.querySelector('#errorSound')
  const input = document.querySelector('#input')
  const game = document.querySelector('#game')

  // Event Listeners
  function appendIncomingMessage(newMessage) {
    const item = document.createElement('li')
    item.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
    document.getElementById('messages').appendChild(item)
  }

  function validateInput(event) {
    const nonLetters = /[^A-Z a-z]/
    if (this.value.match(nonLetters)) {
      errorSound.currentTime = 0
      errorSound.play()
      // need to add visual alert in to hud in future
    }

    this.value = this.value.toUpperCase()
    this.value = this.value.replace(/[^A-Z ]/g, '')
  }

  function sendMessage() {
    const inputText = document.getElementById('input').value
    document.getElementById('input').value = ''

    socket.emit('message', {
      message: inputText
    })
  }

  // Transitions
  function onEnter() {
    socket.on('message', appendIncomingMessage)
    input.addEventListener('input', validateInput)
    input.addEventListener('keyup', enterKeyPressed(sendMessage))
    game.hidden = false
    input.focus()
  }

  function onExit() {

  }

  return {
    onEnter,
    onExit
  }
})()

stateManager.register('game', gameHandler)
