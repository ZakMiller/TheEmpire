'use strict'

const {
  socket
} = require('./shared')
const customAlert = require('./alert')
const body = document.querySelector('body')
const wordCounter = document.querySelector('#wordCounter')
const requiredWordCounter = document.querySelector('#requiredWordCounter')
const errorCounter = document.querySelector('#errorCounter')
const errorSound = document.querySelector('#errorSound')

const VALID_CHARS_REGEXP = /^[A-Z]$/

// setup the list within the sentenceBuilder tag
const inputElement = document.querySelector('#sentenceBuilder')
const words = document.createElement('p')
inputElement.appendChild(words)

let RANDOM_WORDS
let WORD_COUNT
let REQUIRED_KEYWORD_COUNT = 5 // default

const CURSOR_BLINK_INTERVAL = 500
let displayRefresher

let sentence = ''
let oldSentence = sentence
let latestVersion = 0
let currentRequiredWordCount = 0
let oldClasses = {}
let cursorPos = 0
let cursorChar = '_'

function keydownListener(event) {
  const key = event.key.toUpperCase()
  if (VALID_CHARS_REGEXP.test(key)) {
    handleValidChars(key)
    updateDisplay()
  } else {
    switch (key) {
      case ' ':
        handleSpace()
        updateDisplay()
        break
      case 'BACKSPACE':
        handleBackspace()
        updateDisplay()
        break
      case 'DELETE':
        handleDelete()
        updateDisplay()
        break
      case 'ARROWLEFT':
        moveCursorLeft(event)
        updateDisplay()
        break
      case 'ARROWRIGHT':
        moveCursorRight(event)
        updateDisplay()
        break
      case 'HOME':
        moveCursorLeft({
          shiftKey: true
        })
        updateDisplay()
        break
      case 'END':
        moveCursorRight({
          shiftKey: true
        })
        updateDisplay()
        break
      case 'ENTER':
        handleEnter()
        break
      case 'F11': // full screen (default in windows chrome)
      case 'CONTROL':
      case 'SHIFT':
        break
      default:
        handleBadKeystrokes()
    }
  }
}

function updateChecklist() {
  const wordsArray = sentence.trim().split(' ')
  const numWords = sentence.length ? wordsArray.length : 0
  updateChecklistCounter(wordCounter, numWords, WORD_COUNT)
  if (REQUIRED_KEYWORD_COUNT) {
    updateChecklistCounter(requiredWordCounter, currentRequiredWordCount, REQUIRED_KEYWORD_COUNT, false)
  } else {
    requiredWordCounter.textContent = ' N/A'
  }
  const errorCount = Object.keys(oldClasses).reduce((count, index) => {
    if (oldClasses[index] === 'error' || oldClasses[index] === 'duplicate') {
      ++count
    }
    return count
  }, 0)
  updateChecklistCounter(errorCounter, errorCount, 0)
}

function updateChecklistCounter(counterElem, curCount, requiredCount, needsExactCount = true) {
  const firstPart = `${curCount < 10 ? '&nbsp;' : ''}${curCount}`
  const secondPart = requiredCount ? `/${requiredCount}` : ''
  counterElem.innerHTML = `${firstPart}${secondPart}`
  if (needsExactCount ? curCount !== requiredCount : curCount < requiredCount) {
    counterElem.classList.add('error')
  } else {
    counterElem.classList.remove('error')
  }
}

function moveCursorLeft({
  ctrlKey,
  shiftKey
} = {}) {
  if (ctrlKey) {
    do {
      moveCursorLeft()
    } while (cursorPos !== 0 && sentence.charAt(cursorPos - 1) !== ' ')
  } else if (shiftKey) {
    cursorPos = 0
  } else {
    cursorPos && --cursorPos
  }
}

function moveCursorRight({
  ctrlKey,
  shiftKey
} = {}) {
  if (ctrlKey) {
    while (cursorPos !== sentence.length && sentence.charAt(cursorPos) !== ' ') {
      moveCursorRight()
    }
    moveCursorRight()
  } else if (shiftKey) {
    cursorPos = sentence.length
  } else {
    cursorPos < sentence.length && ++cursorPos
  }
}

function getWordIndexOfCursor(wordsArray) {
  let letterCount = 0

  for (let i = 0; i !== wordsArray.length; ++i) {
    const wordLength = wordsArray[i].length
    letterCount += wordLength
    if (letterCount >= cursorPos) {
      return {
        word: i,
        letter: cursorPos - letterCount + wordLength
      }
    }
    ++letterCount
  }

  return {
    word: 0,
    letter: 0
  }
}

function getSpanHTML(word, wordId, className = oldClasses[wordId]) {
  return `<span id="${wordId}" ${className ? `class="${className}"` : ''}>${word}</span>`
}

function classifyWords(wordsArray, randomWords) {
  wordsArray = wordsArray.filter(word => word !== '')
  const wordClasses = []
  const indexesToCheck = []
  const wordSet = {}

  clearMarkedRequiredWords()
  wordsArray.forEach((word, i) => {
    if (wordSet[word] !== undefined) {
      wordSet[word].push(i)
      wordSet[word].forEach(index => {
        indexesToCheck.splice(indexesToCheck.indexOf(index), 1)
        wordClasses[index] = 'duplicate'
      })
    } else {
      wordSet[word] = [i]
      if (RANDOM_WORDS.includes(word)) {
        // words.querySelector(`#word${i}`).className = 'keyword'
        wordClasses[i] = 'keyword'
        markRequiredWord(word)
      } else {
        indexesToCheck.push(i)
      }
    }
  })
  const wordsToCheck = wordsArray.filter((_, i) => indexesToCheck.includes(i))
  const currentVersion = ++latestVersion
  socket.emit('spellcheck', wordsToCheck, function afterSpellcheck(spelledCorrectly) {
    if (currentVersion === latestVersion) { // might have been updated while waiting for server
      for (let i = 0; i !== spelledCorrectly.length; ++i) {
        wordClasses[indexesToCheck[i]] = spelledCorrectly[i] ? '' : 'error'
      }
      // add classes to word spans
      oldClasses = {}
      wordClasses.forEach((className, i) => {
        const wordId = `word${i}`
        if (className) {
          oldClasses[wordId] = className
          words.querySelector(`#${wordId}`).className = className
        } else {
          delete oldClasses[wordId]
        }
      })
      updateDisplay()
    }
  })
}

function clearMarkedRequiredWords() {
  const requiredWords = document.querySelectorAll('.requiredWord')
  for (let i = 0; i !== requiredWords.length; ++i) {
    requiredWords[i].classList.remove('marked')
  }
  currentRequiredWordCount = 0
}

function markRequiredWord(word) {
  const requiredWords = document.querySelectorAll('.requiredWord')
  for (let i = 0; i !== requiredWords.length; ++i) {
    if (requiredWords[i].textContent === word) {
      requiredWords[i].classList.add('marked')
      ++currentRequiredWordCount
      break
    }
  }
}

function updateDisplay(renderCursor = true) {
  clearTimeout(displayRefresher)
  let wordsArray = sentence.split(' ')
  const indexOfCursor = getWordIndexOfCursor(wordsArray)

  if (sentence !== oldSentence) {
    classifyWords(wordsArray, RANDOM_WORDS)
    oldSentence = sentence
  }

  wordsArray = wordsArray.map((word, i) => {
    let spaceNeededAfterWord = true
    const wordId = `word${i}`
    if (i === indexOfCursor.word) {
      if (renderCursor) {
        const wordLength = word.length
        word = `${word.slice(0, indexOfCursor.letter)}${cursorChar}${word.slice(indexOfCursor.letter + 1, wordLength)}`
        if (indexOfCursor.letter === wordLength) {
          spaceNeededAfterWord = false
        }
      }
    }

    return `${getSpanHTML(word, wordId)}${spaceNeededAfterWord ? ' ' : ''}`
  })
  words.innerHTML = `> ${wordsArray.join('')}`
  updateChecklist()
  displayRefresher = setTimeout(() => updateDisplay(!renderCursor), CURSOR_BLINK_INTERVAL)
}

function resetWords() {
  sentence = ''
  oldSentence = sentence
  latestVersion = 0
  currentRequiredWordCount = 0
  oldClasses = {}
  cursorPos = 0
  words.innerHTML = ''
}

function insertCharAtCursor(char) {
  if (char) {
    sentence = `${sentence.slice(0, cursorPos)}${char}${sentence.slice(cursorPos)}`
    moveCursorRight()
  } else {
    sentence = `${sentence.slice(0, cursorPos && cursorPos - 1)}${sentence.slice(cursorPos)}`
    // trimLeft() to clear leading space if present (first word is deleted).
    // replace() to dedupe spaces after word is removed
    sentence = sentence.trimLeft().replace(/ {2}/g, ' ')
    moveCursorLeft()
  }
}

function handleValidChars(key) {
  event.preventDefault()
  insertCharAtCursor(key)
}

function handleSpace() {
  const curChar = sentence.charAt(cursorPos)
  if (cursorPos === 0 || sentence.charAt(cursorPos - 1) === ' ') {
    return // do nothing if no word to add
  } else if (curChar === ' ') {
    moveCursorRight()
  } else {
    insertCharAtCursor(' ')
  }
}

function handleBackspace() {
  if (sentence.length) {
    insertCharAtCursor()
  }
}

function handleDelete() {
  if (sentence.length && cursorPos !== sentence.length) {
    moveCursorRight()
    insertCharAtCursor()
  }
}

function handleEnter() {
  socket.emit('message', {
    message: sentence.trim()
  }, function handleValidationError(err) {
    if (err) {
      const isError = true
      customAlert(err, isError)
    } else {
      resetWords()
    }
  })
}

function handleBadKeystrokes() {
  event.preventDefault()
  errorSound.currentTime = 0
  errorSound.play()
  const isError = true
  customAlert('Invalid input!', isError)
}

module.exports = {

  enable(wordCount, randomWordList) {
    RANDOM_WORDS = randomWordList
    if (randomWordList.length === 0) {
      REQUIRED_KEYWORD_COUNT = 0
    }
    WORD_COUNT = wordCount
    resetWords()
    updateDisplay()
    body.addEventListener('keydown', keydownListener)
  },

  disable() {
    clearTimeout(displayRefresher)
    words.innerHTML = ''
    body.removeEventListener('keydown', keydownListener)
  }

}
