'use strict'

const {
  socket
} = require('./shared')
const requiredWords = require('./requiredWords')

const roles = require('./roles')
const input = require('./sentenceBuilder')
const customAlert = require('./alert')

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
const gameTimer = document.querySelector('#gameTimer')

let timeoutReference

const ONE_SECOND = 1000 // ms
const SENTENCE_WORD_COUNT = 10
const VOTE_TIMER = 10 // sec

let messageId = 0

// Event Listeners
function appendIncomingMessage(newMessage) {
  const item = document.createElement('li')
  if (newMessage.name === 'The Judge') {
    item.className += 'judgeMessage'
    item.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
  } else {
    const radioButton = document.createElement('input')
    radioButton.setAttribute('type', 'radio')
    radioButton.setAttribute('name', 'vote-options')
    radioButton.id = ++messageId
    item.appendChild(radioButton)
    const label = document.createElement('label')
    label.setAttribute('for', messageId)
    label.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
    item.appendChild(label)
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
  const players = Array.from(playerList.querySelectorAll('li'))

  for (let player of players) {
    if (player.textContent === activePlayer) {
      player.textContent = '> ' + activePlayer
    } else if (player.textContent.substring(0, 2) === '> ') {
      player.textContent = player.textContent.substring(2)
    }
  }
}

function progressGame(newJob, roundCount, activePlayer, winner) {
  roundCounter.textContent = `ROUND ${roundCount}`
  showIsActivePlayer(activePlayer)
  switch (newJob) {
    case 'chat':
      wordCounter.hidden = false
      customInput.hidden = false
      requiredWordsList.hidden = false
      customAlert('your turn!')
      break
    case 'wait':
      wordCounter.hidden = false
      customInput.hidden = false
      requiredWordsList.hidden = false
      customAlert(activePlayer + "'s turn")
      break
    case 'vote':
      startVoteCountDown(VOTE_TIMER)
      break
    case 'done':
      wordCounter.hidden = true
      customInput.hidden = true
      requiredWordsList.hidden = true
      break
    case 'end':
      customAlert(`TEAM <${winner.toUpperCase()}> WON!!!!`)
      break
  }
}

function handleNewWordList(wordList = []) {
  let randomWordList = wordList
  requiredWords.addWords(randomWordList) // randomWordList will be empty unless AI
  input.disable()
  input.enable(SENTENCE_WORD_COUNT, randomWordList)
}

function startVoteCountDown(delayInSeconds) {
  clearTimeout(timeoutReference)

  if (delayInSeconds > 0) { // if we still have some time to count down
    gameTimer.textContent = `${delayInSeconds} SECONDS LEFT TO VOTE...`
    timeoutReference = setTimeout(() => {
      startVoteCountDown(delayInSeconds - 1)
    }, ONE_SECOND)
  } else {
    gameTimer.textContent = ''
    vote()
  }
}

function vote() {
  const nameRegex = /<(.*)>/
  const message = (document.querySelector('input[type="radio"]:checked+label') || {}).textContent
  if (!message) {
    customAlert('YOU FAILED TO VOTE')
    socket.emit('vote', null)
  } else {
    const [, nameVotedFor] = message.match(nameRegex) || [] // 1st capture group will be 2nd elem, if found
    customAlert(`You voted for <${nameVotedFor}>`)
    socket.emit('vote', nameVotedFor)
  }

  messages.innerHTML = ''
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
