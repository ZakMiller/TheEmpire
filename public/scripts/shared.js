'use strict'

const socket = require('socket.io-client')()

function createListItem(classes = [], text = '') {
  let li = document.createElement('li')
  classes.forEach(className => li.classList.add(className))
  if (text) {
    li.appendChild(document.createTextNode(text))
  }
  return li
}

module.exports = {
  socket,

  // Shared Helper Functions
  keyListener(key, callback) {
    return function keyEventListener(event) {
      console.log(`'${event.key}'`)
      if (event.key === key) {
        event.preventDefault()
        callback()
      }
    }
  },

  addListItem(ulElem, classes = [], text = '') {
    const li = createListItem(classes, text)
    ulElem.appendChild(li)
    return li
  },

  addListItemAsPenultimateChild(ulElem, classes = [], text = '') {
    const li = createListItem(classes, text)
    ulElem.insertBefore(li, ulElem.lastChild)
    return li
  }
}
