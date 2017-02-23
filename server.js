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

const MIN_PLAYER_COUNT = 1
const START_GAME_DELAY = 1 // sec
const ONE_SECOND = 1000
const DELAY_BUFFER_IN_MS = 200
const STARTING_REQUIRED_WORD_COUNT = 10
const REQUIRED_SENTENCE_LENGTH = 10
const REQUIRED_KEYWORD_COUNT = 3

const EXTRA_VALID_WORDS_REGEXP = /^[ai]$/

let currentRoom = generateRoomName()
let countDownTimer = null

httpServer.listen(80)

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
      currentRoom = generateRoomName()
      users.clear()
      io.emit('lobbyUpdate', users.list())
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
        client.emit('assignWords', [])
      } else {
        client.emit('setRole', 'AI')
        client.wordList = []
        client.emit('assignWords', assignWordListFor(client))
      }
    })
  })
}

function handleSocketConnection(socket) {
  socket.emit('stateChange', 'login')
  socket.emit('lobbyUpdate', users.list())

  socket.on('register', function register(username, cb) {
    if (!username) {
      return cb('username must not be empty')
    }
    if (users.has(username)) {
      return cb('username taken')
    }
    socket.username = username
    socket.gameRoom = currentRoom
    users.add(username)
    socket.join(currentRoom)
    cb(null) // signal success
    io.to(currentRoom).emit('lobbyUpdate', users.list())

    if (users.count() >= MIN_PLAYER_COUNT) {
      startGame()
    }
  })

  socket.on('message', function messageHandler({
    message
  }, cb) {
    if (sentenceIsValid(message, socket.wordList)) {
      cb(null)
      io.to(socket.gameRoom).emit('message', {
        name: socket.username,
        message
      })
      // give the client another list of words
      socket.emit('assignWords', assignWordListFor(socket))
    } else {
      cb('Invalid Sentence')
    }
  })

  socket.on('spellCheck', function spellChecker(word, cb) {
    word = word.toLowerCase()
    cb(EXTRA_VALID_WORDS_REGEXP.test(word) || dictionary.check(word))
  })

  socket.on('disconnect', function disconnect() {
    if (users.has(socket.username)) {
      users.delete(socket.username)
      io.emit('lobbyUpdate', users.list())
    }
  })
}

function sentenceIsValid(sentence, wordList = []) {
  const words = sentence.split(' ')
  if (words.length !== REQUIRED_SENTENCE_LENGTH) {
    return false
  }

  const wordSet = new Set()
  let keywordCount = 0
  for (let i = 0; i !== words.length; ++i) {
    const currentWord = words[i]
    if (wordSet.has(currentWord)) {
      return false
    } else {
      wordSet.add(currentWord)
      if (wordList.includes(currentWord)) {
        ++keywordCount
      }
    }
  }

  return !wordList.length || keywordCount >= REQUIRED_KEYWORD_COUNT
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
