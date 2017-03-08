'use strict'

let io

const NUM_ROUNDS = 5
let round = 0
let allClients
let clientsLeft
let activePlayerID
let activePlayer
let state

function containsObject(obj, list) {
  var i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }

  return false
}

module.exports = {
  get activePlayerID() {
    return activePlayerID
  },
  get state() {
    return state
  },
  start(ioIn, room, users) {
    io = ioIn
    io.in(room).clients((err, clients) => {
      if (err) {
        throw err
      }
      allClients = clients
      this.nextRound(users)
    })
  },

  nextRound(users) {
    round += 1
    if (round <= NUM_ROUNDS) {
      this.startChat(users)
    } else {
      this.endGame()
    }
  },

  startChat(users) {
    clientsLeft = allClients.slice(0)
    this.continueChat(users)
  },

  continueChat(users) {
    const randomPlayer = clientsLeft[Math.floor(Math.random() * clientsLeft.length)]
    activePlayerID = randomPlayer
    if (activePlayerID !== undefined) {
      activePlayer = users.getNameFromID(activePlayerID)
    } else {
      activePlayer = undefined
    }
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
    if (clientsLeft.length !== 0) {
      const lastChatterIndex = clientsLeft.indexOf(randomPlayer)
      clientsLeft.splice(lastChatterIndex, 1)
    } else {
      this.startVote()
    }
  },

  startVote() {
    allClients.forEach(clientId => {
      const client = io.sockets.connected[clientId]
      state = 'vote'
      client.emit('progressGame', 'vote', round, activePlayer)
    })
  },

  endGame() {
    allClients.forEach(clientId => {
      const client = io.sockets.connected[clientId]
      client.emit('progressGame', 'end', round, activePlayer)
    })
  }
}
