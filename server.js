'use strict'

const express = require('express')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const dictionary = require('check-word')('en')

const users = require('./users')
const {
  generateWords
} = require('./randomWords')
const {
  generateRoomName
} = require('./rooms')
const roundManager = require('./roundManager')

const MIN_PLAYER_COUNT = 3
const START_GAME_DELAY = 5 // sec
const ONE_SECOND = 1000
const DELAY_BUFFER_IN_MS = 200
const STARTING_REQUIRED_WORD_COUNT = 10
const REQUIRED_SENTENCE_LENGTH = 10
const REQUIRED_KEYWORD_COUNT = 5

const EXTRA_VALID_WORDS_REGEXP = /^[ai]$/

let currentRoom = generateRoomName()
let countDownTimer = null
let votesNeeded
let playerCount

httpServer.listen(process.env.PORT || 80)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', handleSocketConnection)

function startGame() {
  console.log(`${currentRoom} will start a game in ${START_GAME_DELAY} sec`)
  clearTimeout(countDownTimer)

  countDownTimer = setTimeout(function startAGame() {
    if (users.count() >= MIN_PLAYER_COUNT) { // if nobody has left lobby
      io.to(currentRoom).emit('stateChange', 'game')
      console.log(`${currentRoom} started a game!`)

      assignRoles(currentRoom)

      roundManager.start(io, currentRoom, users)
      currentRoom = generateRoomName()
    }
  }, START_GAME_DELAY * ONE_SECOND + DELAY_BUFFER_IN_MS)
  io.to(currentRoom).emit('countdown', START_GAME_DELAY)
}

function assignRoles(currentRoom) {
  io.in(currentRoom).clients((err, clients) => {
    if (err) {
      throw err
    }

    const playerCount = clients.length

    const humanID = clients[Math.floor(Math.random() * playerCount)]
    clients.forEach(clientId => {
      const client = io.sockets.connected[clientId]
      if (clientId === humanID) {
        client.emit('setRole', 'human')
        client.role = 'human'
        client.emit('assignWords', [])
      } else {
        client.emit('setRole', 'AI')
        client.role = 'AI'
        client.wordList = []
        client.emit('assignWords', assignWordListFor(client))
      }
    })
  })
}

function handleSocketConnection(socket) {
  socket.emit('stateChange', 'login')
  socket.emit('lobbyUpdate', users.names())

  socket.on('register', function register(username, cb) {
    if (!username) {
      return cb('username must not be empty')
    }
    if (username.toLowerCase().includes('judge')) {
      return cb("username cannot include 'judge'")
    }
    if (users.has(username)) {
      return cb('username taken')
    }
    socket.username = username
    socket.gameRoom = currentRoom
    users.add(username, socket.id)
    socket.join(currentRoom)
    cb(null) // signal success
    io.to(currentRoom).emit('lobbyUpdate', users.names())

    if (users.count() >= MIN_PLAYER_COUNT) {
      startGame()
      votesNeeded = users.count()
      playerCount = users.count()
    }
  })

  socket.on('message', function messageHandler({
    message
  }, cb) {
    const errorMsg = socket.id === roundManager.activePlayerID ? validateSentence(message, socket.wordList) : 'Cannot submit until your turn'
    if (!errorMsg) {
      cb(null)
      io.to(socket.gameRoom).emit('message', {
        name: socket.username,
        message
      })
      // give the client another list of words
      socket.emit('assignWords', assignWordListFor(socket))
      roundManager.continueChat(users)
    } else {
      cb(errorMsg)
    }
  })

  socket.on('spellcheck', function spellChecker(words, cb) {
    const spelledCorrectly = []
    words.forEach((word, i) => {
      spelledCorrectly[i] = wordIsValid(word)
    })
    cb(spelledCorrectly)
  })

  socket.on('vote', function tallyVote(vote) {
    if (roundManager.state === 'vote') {
      users.vote(vote)
      votesNeeded--
      if (votesNeeded === 0) {
        votesNeeded = playerCount
        roundManager.nextRound(users)
        if (roundManager.state === 'end') {
          endGame()
        }
      }
      console.log(`Vote cast for <${vote}>`)
    }
  })

  socket.on('disconnect', function disconnect() {
    if (users.has(socket.username)) {
      users.delete(socket.username)
      io.emit('lobbyUpdate', users.names())
    }
  })
}

function wordIsValid(word) {
  word = word.toLowerCase()
  return EXTRA_VALID_WORDS_REGEXP.test(word) || dictionary.check(word)
}

function validateSentence(sentence, wordList = []) {
  const words = sentence.split(' ')
  if (words.length !== REQUIRED_SENTENCE_LENGTH) {
    return `Sentence must be ${REQUIRED_SENTENCE_LENGTH} words long`
  }

  const wordSet = new Set()
  let keywordCount = 0
  for (let i = 0; i !== words.length; ++i) {
    const currentWord = words[i]
    if (wordSet.has(currentWord)) {
      return `'${currentWord}' was used more than once`
    } else if (!wordIsValid(currentWord)) {
      return `'${currentWord}' is not a valid word`
    } else {
      wordSet.add(currentWord)
      if (wordList.includes(currentWord)) {
        ++keywordCount
      }
    }
  }

  if (wordList.length && keywordCount < REQUIRED_KEYWORD_COUNT) {
    return `AI must use at least ${REQUIRED_KEYWORD_COUNT} keywords`
  }
  // if passes all checks, return null error message
  return null
}

function assignWordListFor(socket) {
  if (socket.wordList) {
    const wordList = generateWords(STARTING_REQUIRED_WORD_COUNT)
    socket.wordList = wordList
    return wordList
  } else {
    return []
  }
}

function endGame() {
  const winner = users.getMostVoted()
  const role = io.sockets.connected[users.getId(winner)]
  console.log(`client's role ${role}`)
  if (role === 'AI') {
    roundManager.endGame('AI')
  } else {
    roundManager.endGame('human')
  }
}
