'use strict'

const randomWords = require('random-words')

function getRandomWords(wordCount) {
  return randomWords(wordCount)
}

module.exports = {
  addWords(wordCount) {
    let randomWords = getRandomWords(wordCount)
    randomWords.sort()
    for (const word of randomWords) {
      const item = document.createElement('li')
      item.appendChild(document.createTextNode(word))
      document.querySelector('#requiredWordsList').appendChild(item)
    }
  }
}
