'use strict'

const randomWords = require('random-words')

function getRandomWords(wordCount) {
  return randomWords(wordCount)
}

module.exports = {
  generateWords(wordCount) {
    return getRandomWords(wordCount).sort().map(word => word.toUpperCase())
  },

  addWords(randomWords) {
    for (const word of randomWords) {
      const item = document.createElement('li')
      item.className = 'requiredWord'
      item.appendChild(document.createTextNode(word))
      document.querySelector('#requiredWordsList').appendChild(item)
    }
  }
}
