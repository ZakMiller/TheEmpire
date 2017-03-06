'use strict'

const {
  socket
} = require('./shared')
const requiredWords = require('./requiredWords')

const roles = require('./roles')
const input = require('./customInput')

const game = document.querySelector('#game')
const image = document.querySelector('#image')
const name = document.querySelector('#name')
const description = document.querySelector('#description')
const messages = document.querySelector('#messages')
const wordCounter = document.querySelector('#wordCounter')
const customInput = document.querySelector('#customInput')
const requiredWordsList = document.querySelector('#requiredWordsList')
const roundCounter = document.querySelector('#roundCounter')
const playerList = document.querySelector('#playerList')

const SENTENCE_WORD_COUNT = 10

// Event Listeners
function appendIncomingMessage(newMessage) {
  const item = document.createElement('li')
  item.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
  item.onmousedown = function() {
    alert('you just voted!')
    socket.emit('vote', newMessage.name)
  }
  messages.appendChild(item)
}

function setRole(roleName) {
  const role = roles.getRole(roleName)
  displayRole(role)
}

function displayRole(role) {
  image.src = role.image
  name.textContent = role.name
  description.textContent = role.description
}

function showIsActivePlayer(activePlayer) {
  const playerListArray = Array.from(playerList.childNodes)
  const players = playerListArray.filter(function(node) {
    return node.nodeName === 'LI'
  })
  for (let player of players) {
    if (player.innerText === activePlayer) {
      player.innerText = '> ' + activePlayer
    } else if (player.innerText.substring(0, 2) === '> ') {
      player.innerText = player.innerText.substring(2)
    }
  }
}

function progressGame(newJob, roundCount, activePlayer) {
  roundCounter.textContent = `ROUND ${roundCount}`
  showIsActivePlayer(activePlayer)
  if (newJob === 'chat') {
    wordCounter.hidden = false
    customInput.hidden = false
    requiredWordsList.hidden = false
    alert('your turn!')
  } else if (newJob === 'wait') {
    wordCounter.hidden = false
    customInput.hidden = false
    requiredWordsList.hidden = false
    alert(activePlayer + "'s turn")
  } else if (newJob === 'vote') {
    alert('vote!')
  } else if (newJob === 'done') {
    wordCounter.hidden = true
    customInput.hidden = true
    requiredWordsList.hidden = true
  } else if (newJob === 'end') {
    alert('THE END!')
  }
}

function handleNewWordList(wordList = []) {
  let randomWordList = wordList
  requiredWords.addWords(randomWordList) // randomWordList will be empty unless AI
  input.disable()
  input.enable(SENTENCE_WORD_COUNT, randomWordList)
}

// Transitions
function onEnter() {
  socket.on('assignWords', handleNewWordList)
  socket.on('message', appendIncomingMessage)
  socket.on('setRole', setRole)
  socket.on('progressGame', progressGame)
  game.hidden = false
}

function onExit() {

}

module.exports = {
  onEnter,
  onExit
}
