'use strict'

const randomWords = require('random-words')

function getRandomWords(wordCount) {
  return randomWords(wordCount)
}

module.exports = {
  generateWords(wordCount) {
    return getRandomWords(wordCount).sort().map(word => word.toUpperCase())
  }
}
