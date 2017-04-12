'use strict'

const randomWords = require('random-words')

function getRandomWords(wordCount) {
  let words
  do {
    words = randomWords(wordCount)
  } while (!allElemsUnique(words))
  return randomWords(wordCount)
}

function allElemsUnique(arr) {
  return arr.length === new Set(arr).size
}

module.exports = {
  generateWords(wordCount) {
    return getRandomWords(wordCount).sort().map(word => word.toUpperCase())
  }
}
