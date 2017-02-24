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

const SENTENCE_WORD_COUNT = 10

// Event Listeners
function appendIncomingMessage(newMessage) {
  const item = document.createElement('li')
  item.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
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
  game.hidden = false
}

function onExit() {

}

module.exports = {
  onEnter,
  onExit
}
