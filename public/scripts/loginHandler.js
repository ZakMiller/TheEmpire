'use strict'

const {
  socket,
  keyListener
} = require('./shared')

const ONE_SECOND = 1000

let myUsername
const nameInput = document.querySelector('#nameInput')
const registration = document.querySelector('#registration')
const lobby = document.querySelector('#lobby')
const lobbyList = document.querySelector('#lobbyList')
const countdownBanner = document.querySelector('#countdownBanner')

let timeoutReference

// Event Listeners
function updateLobby(usernames) {
  lobbyList.innerHTML = ''
  usernames.forEach(username => {
    const listItem = document.createElement('li')
    const text = (username === myUsername) ? `> ${username}` : username
    listItem.appendChild(document.createTextNode(text))
    lobbyList.appendChild(listItem)
  })
}

function register() {
  myUsername = document.querySelector('#nameInput').value
  socket.emit('register', myUsername, function handleRegisterError(err) {
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
    countdownBanner.textContent = `GAME WILL START IN ${delayInSeconds} SECONDS...`
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
  nameInput.addEventListener('keyup', keyListener('Enter', register))
}

function onExit() {
  // TODO fix this remove listener thing will need to name these
  // handlers and store a ref
  nameInput.removeEventListener('keyup', keyListener('Enter', register))
  nameInput.blur()
  socket.removeAllListeners('lobbyUpdate')
  socket.removeAllListeners('countdown')
  document.querySelector('#playerList').innerHTML = lobbyList.innerHTML
  lobby.hidden = true
}

module.exports = {
  onEnter,
  onExit
}
