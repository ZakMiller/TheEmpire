'use strict'

const socket = require('socket.io-client')()
var username = prompt('enter your name')
var sound1 = document.getElementById('mySound');
socket.on('incomingMessage', appendIncomingMessage)

document.querySelector('#input').addEventListener('input', function(event) {
  var nonLetters = /[^A-Z a-z]/;
  if (this.value.match(nonLetters)) {
    sound1.currentTime = 0;
    sound1.play();
    // need to add visual alert in to hud in future

  }

  this.value = this.value.toUpperCase()
  this.value = this.value.replace(/[^A-Z ]/g, '')
})

function appendIncomingMessage(newMessage) {
  var item = document.createElement('li')
  item.appendChild(document.createTextNode(`<${newMessage.name}> ${newMessage.message}`))
  document.getElementById('messages').appendChild(item)
}

// sends message to the server/terminal
function sendMessage() {
  var inputText = document.getElementById('input').value
  document.getElementById('input').value = ''

  socket.emit('message', {
    name: username,
    message: inputText
  })
}

document.getElementById('input').addEventListener('keyup', function(event) {
  event.preventDefault()
  var ENTER_KEY = 13
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
  }
})
