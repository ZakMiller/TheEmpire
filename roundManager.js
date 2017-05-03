'use strict'

const questions = require('./questions')

const NUM_ROUNDS = 5

module.exports =
  class RoundManager {
    constructor(ioIn, roomIn, users) {
      this.round = 0
      this.io = ioIn
      this.room = roomIn
      this.io.in(this.room).clients((err, clients) => {
        if (err) {
          throw err
        }
        this.allClients = clients
        this.nextRound(users)
      })
    }

    nextRound(users) {
      ++this.round
      if (this.round <= NUM_ROUNDS) {
        this.startChat(users)
      } else {
        this.state = 'end'
      }
    }

    sendJudgeQuestion() {
      const question = questions.getQuestion()
      let messageToSend
      this.allClients.forEach(clientId => {
        const client = this.io.sockets.connected[clientId]
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
            alert(err) // TODO better warning
          }
        })
      })
    }

    startChat(users) {
      this.clientsLeft = this.allClients.slice(0)
      this.sendJudgeQuestion()
      this.continueChat(users)
    }

    continueChat(users) {
      if (this.clientsLeft.length !== 0) {
        const randomPlayer = this.clientsLeft[Math.floor(Math.random() * this.clientsLeft.length)]
        this.activePlayerID = randomPlayer
        this.activePlayer = users.getNameFromID(this.activePlayerID)

        this.allClients.forEach(clientId => {
          const client = this.io.sockets.connected[clientId]
          if (clientId === randomPlayer) {
            this.state = 'chat'
            client.emit('progressGame', 'chat', this.round, this.activePlayer)
          } else {
            if (this.clientsLeft.includes(clientId)) {
              client.emit('progressGame', 'wait', this.round, this.activePlayer)
            } else {
              // Done for the this.round.
              client.emit('progressGame', 'done', this.round, this.activePlayer)
            }
          }
        })

        const lastChatterIndex = this.clientsLeft.indexOf(randomPlayer)
        this.clientsLeft.splice(lastChatterIndex, 1)
      } else {
        this.io.to(this.room).emit('progressGame', 'done', this.round)
        this.startVote()
      }
    }

    startVote() {
      this.allClients.forEach(clientId => {
        this.state = 'vote'
        const client = this.io.sockets.connected[clientId]
        client.emit('progressGame', 'vote', this.round, this.activePlayer)
      })
    }

    endGame(winningTeam) {
      this.allClients.forEach(clientId => {
        const client = this.io.sockets.connected[clientId]
        client.emit('progressGame', 'end', this.round, this.activePlayer, winningTeam)
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
