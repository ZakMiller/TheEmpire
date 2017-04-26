'use strict'

const fs = require('fs')

// const names = new Set()
let questions = []

function shuffle(array) {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

module.exports = {
  getQuestion() {
    if (questions.length === 0) {
      questions = fs.readFileSync('questions.txt').toString().split('\n')
      questions = shuffle(questions)
    }
    return questions.pop()
  }
}
