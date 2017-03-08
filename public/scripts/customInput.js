'use strict'

const {
  socket,
  addListItem,
  addListItemAsPenultimateChild
} = require('./shared')

const body = document.querySelector('body')
const wordCounter = document.querySelector('#wordCounter')
const errorSound = document.querySelector('#errorSound')

const VALID_CHARS_REGEXP = /^[A-Z]$/

// setup the list within the customInput tag
const inputElement = document.querySelector('#customInput')
const words = document.createElement('ul')
words.classList.add('words')
inputElement.appendChild(words)

let currentWord
const wordSet = new Set()
let RANDOM_WORDS
let WORD_COUNT
const REQUIRED_KEYWORD_COUNT = 3

function keydownListener(event) {
  const key = event.key.toUpperCase()
  if (VALID_CHARS_REGEXP.test(key)) {
    handleValidChars(key)
  } else {
    switch (key) {
      case ' ':
        handleSpace()
        break
      case 'BACKSPACE':
        handleBackspace()
        break
      case 'ENTER':
        handleEnter()
        break
      default:
        handleBadKeystrokes()
    }
  }
  updateWordCounter()
}

function resetWords() {
  words.innerHTML = ''
  addListItem(words, ['word', 'cursor'], ' ')
  currentWord = addListItemAsPenultimateChild(words, ['word'])
  updateWordCounter()
}

function updateWordCounter() {
  let numWords = words.querySelectorAll('.word:not(.cursor)').length
  if (currentWord.textContent === '') {
    --numWords
  }
  wordCounter.textContent = `${numWords}/${WORD_COUNT}`
  if (numWords !== WORD_COUNT) {
    wordCounter.classList.add('error')
  } else {
    wordCounter.classList.remove('error')
  }
}

function classifyWord() {
  const currentText = currentWord.textContent
  currentWord.className = 'word'
  if (wordSet.has(currentText)) {
    currentWord.classList.add('error')
  } else if (RANDOM_WORDS.includes(currentText)) {
    currentWord.classList.add('keyword')
    toggleMarkForWord(currentText)
  } else {
    socket.emit('spellCheck', currentText, function spellCheckCallback(isValid) {
      if (!isValid) {
        currentWord.classList.add('error')
      }
    })
  }
}

function toggleMarkForWord(word) {
  const requiredWords = document.querySelectorAll('.requiredWord')
  for (let i = 0; i < requiredWords.length; ++i) {
    if (requiredWords[i].textContent === word) {
      requiredWords[i].classList.toggle('marked')
    }
  }
}

function handleValidChars(key) {
  event.preventDefault()
  currentWord.textContent += key
  classifyWord()
}

function handleSpace() {
  if (currentWord.textContent === '') {
    return // do nothing if no word to add
  }
  wordSet.add(currentWord.textContent)
  currentWord = addListItemAsPenultimateChild(words, ['word'])
}

function handleBackspace() {
  if (currentWord.textContent === '') {
    const typedWords = words.querySelectorAll('.word:not(.cursor)')
    const numWords = typedWords.length
    if (numWords > 1) {
      const lastWord = typedWords[numWords - 2]
      words.removeChild(currentWord)
      currentWord = lastWord
      if (!lastWord.classList.contains('error')) {
        wordSet.delete(lastWord.textContent)
      }
    }
  } else {
    toggleMarkForWord(currentWord.textContent)
    currentWord.textContent = currentWord.textContent.substr(0, currentWord.textContent.length - 1)
    classifyWord()
    toggleMarkForWord(currentWord.textContent)
  }
}

function handleEnter() {
  const typedWords = words.querySelectorAll('.word:not(.cursor)')
  const wordArray = []
  let containsErrors = false
  let keywordCount = 0
  for (let i = 0; i < typedWords.length; ++i) {
    const typedWord = typedWords[i]
    if (typedWord.classList.contains('error')) {
      containsErrors = true
      break
    }
    if (typedWord.classList.contains('keyword')) {
      ++keywordCount
    }
    const text = typedWords[i].textContent
    if (text) {
      wordArray.push(typedWords[i].textContent)
    }
  }

  if (containsErrors) {
    alert(`sentence has too many errors!`) // TODO better warning
    return
  }

  if (wordArray.length !== WORD_COUNT) {
    alert(`sentence must be ${WORD_COUNT} words long`) // TODO better warning
    return
  }

  // check for the min number of required keyword, if applicable
  if (RANDOM_WORDS.length && keywordCount < REQUIRED_KEYWORD_COUNT) {
    alert(`sentence must include ${REQUIRED_KEYWORD_COUNT} required words`) // TODO better warning
    return
  }

  socket.emit('message', {
    message: wordArray.join(' ')
  }, function handleValidationError(err) {
    if (err) {
      alert(err) // TODO better warning
    } else {
      resetWords()
      wordSet.clear()
    }
  })
}

// TODO add visual alert in to hud in future
function handleBadKeystrokes() {
  errorSound.currentTime = 0
  errorSound.play()
}

module.exports = {

  enable(wordCount, randomWordList) {
    RANDOM_WORDS = randomWordList
    WORD_COUNT = wordCount
    resetWords()
    body.addEventListener('keydown', keydownListener)
  },

  disable() {
    words.innerHTML = ''
    body.removeEventListener('keydown', keydownListener)
  }

}
