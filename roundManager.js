'use strict'

const questions = require('./questions')

let io

const NUM_ROUNDS = 5
let round = 0
let allClients
let room
let clientsLeft
let activePlayerID
let activePlayer
let state

module.exports = {
  get activePlayerID() {
    return activePlayerID
  },

  get state() {
    return state
  },

  start(ioIn, roomIn, users) {
    io = ioIn
    room = roomIn
    io.in(room).clients((err, clients) => {
      if (err) {
        throw err
      }
      allClients = clients
      this.nextRound(users)
    })
  },

  nextRound(users) {
    round++
    if (round <= NUM_ROUNDS) {
      this.startChat(users)
    } else {
      state = 'end'
    }
  },

  sendJudgeQuestion() {
    const question = questions.getQuestion()
    let messageToSend
    allClients.forEach(clientId => {
      const client = io.sockets.connected[clientId]
      if (client.role === 'human') {
        messageToSend = getRandomBitString()
      } else {
        messageToSend = question
      }
      client.emit('message', {
        name: 'The Judge',
        message: messageToSend
      }, function handleValidationError(err) {
        if (err) {
          console.log(err)
        }
      })
    })
  },

  startChat(users) {
    clientsLeft = allClients.slice(0)
    this.sendJudgeQuestion()
    this.continueChat(users)
  },

  continueChat(users) {
    if (clientsLeft.length !== 0) {
      const randomPlayer = clientsLeft[Math.floor(Math.random() * clientsLeft.length)]
      activePlayerID = randomPlayer
      activePlayer = users.getNameFromID(activePlayerID)

      allClients.forEach(clientId => {
        const client = io.sockets.connected[clientId]
        if (clientId === randomPlayer) {
          state = 'chat'
          client.emit('progressGame', 'chat', round, activePlayer)
        } else {
          if (clientsLeft.includes(clientId)) {
            client.emit('progressGame', 'wait', round, activePlayer)
          } else {
            // Done for the round.
            client.emit('progressGame', 'done', round, activePlayer)
          }
        }
      })

      const lastChatterIndex = clientsLeft.indexOf(randomPlayer)
      clientsLeft.splice(lastChatterIndex, 1)
    } else {
      io.to(room).emit('progressGame', 'done', round)
      this.startVote()
    }
  },

  startVote() {
    allClients.forEach(clientId => {
      state = 'vote'
      const client = io.sockets.connected[clientId]
      client.emit('progressGame', 'vote', round, activePlayer)
    })
  },

  endGame(winningTeam) {
    allClients.forEach(clientId => {
      const client = io.sockets.connected[clientId]
      client.emit('progressGame', 'end', round, activePlayer, winningTeam)
    })
  }
}

function getRandomBitString() {
  let str = ''
  const length = 80 + Math.floor(Math.random() * 20)
  for (let i = 0; i !== length; ++i) {
    str += Math.floor(Math.random() * 2)
    if (Math.random() < 0.10) {
      str += ' '
    }
  }
  return str
}
