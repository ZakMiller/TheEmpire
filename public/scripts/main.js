'use strict';

var socket = io();
var username = prompt('enter your name');

socket.on('incomingMessage', appendIncomingMessage);

//return true or false if message meets criteria
function isMessageValid() {

}

function appendIncomingMessage(newMessage) {
  var item = document.createElement("li");
  item.appendChild(document.createTextNode(newMessage.name + ': ' + newMessage.message));
  document.getElementById('messages').appendChild(item);
}

//sends message to the server/terminal
function sendMessage() {
  var inputText = document.getElementById('input').value;
  document.getElementById('input').value = '';

  socket.emit('message', {
    name: username,
    message: inputText
  });
}
