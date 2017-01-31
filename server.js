'use strict'

const express = require('express')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

const users = require('./users')
const {
  generateRoomName
} = require('./rooms')

const MIN_PLAYER_COUNT = 3
const START_GAME_DELAY = 5 // sec
const ONE_SECOND = 1000
const DELAY_BUFFER_IN_MS = 200

let currentRoom = generateRoomName()
let countDownTimer = null

httpServer.listen(80)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', handleSocketConnection)

function handleSocketConnection(socket) {
  socket.emit('stateChange', 'login')
  socket.emit('lobbyUpdate', users.list())

  socket.on('register', (username, cb) => {
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
      console.log(`${currentRoom} will start a game in ${START_GAME_DELAY} sec`)
      clearTimeout(countDownTimer)
      countDownTimer = setTimeout(function startAGame() {
        if (users.count() >= MIN_PLAYER_COUNT) { // if nobody has left lobby
          io.to(currentRoom).emit('stateChange', 'game')
          console.log(`${currentRoom} started a game!`)
          currentRoom = generateRoomName()
          users.clear()
          io.emit('lobbyUpdate', users.list())
        }
      }, START_GAME_DELAY * ONE_SECOND + DELAY_BUFFER_IN_MS)
      io.to(currentRoom).emit('countdown', START_GAME_DELAY)
    }
  })

  socket.on('message', data => {
    io.to(socket.gameRoom).emit('message', {
      name: socket.username,
      message: data.message
    })
  })

  socket.on('disconnect', () => {
    if (users.has(socket.username)) {
      users.delete(socket.username)
      io.emit('lobbyUpdate', users.list())
      console.log(users.list())
    }
  })
}
