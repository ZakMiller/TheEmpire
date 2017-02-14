'use strict'

function getRandomWords(wordCount) {
  const randomWords = require('random-words')
  return randomWords(wordCount)
}

module.exports = {
  addWords(wordCount) {
    let randomWords = getRandomWords(wordCount)
    randomWords.sort()
    for (const word of randomWords) {
      const item = document.createElement('li')
      item.appendChild(document.createTextNode(word))
      document.getElementById('requiredWordsList').appendChild(item)
    }
  }
}
