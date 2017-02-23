'use strict'

module.exports = {
  addWords(randomWords) {
    for (const word of randomWords) {
      const item = document.createElement('li')
      item.className = 'requiredWord'
      item.appendChild(document.createTextNode(word))
      document.querySelector('#requiredWordsList').appendChild(item)
    }
  }
}
