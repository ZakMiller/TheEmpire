'use strict'

const express = require('express')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

httpServer.listen(80)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', handleSocketConnection)

function handleSocketConnection (socket) {
  socket.on('message', (data) => {
    io.emit('incomingMessage', {
      name: data.name,
      message: data.message
    })
  })
}
