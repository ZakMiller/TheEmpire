'use strict'

const UTF_CODE_FOR_A = 'A'.charCodeAt(0)
const ALPHABET_LENGTH = 26

const roomNames = new Set()

function generateRandomChar() {
  const charCode = Math.floor(Math.random() * ALPHABET_LENGTH) + UTF_CODE_FOR_A
  return String.fromCharCode(charCode)
}

module.exports = {
  generateRoomName(length = 4) {
    let name
    do {
      name = ''
      for (let i = 0; i !== length; ++i) {
        name += generateRandomChar()
      }
    } while (roomNames.has(name))

    roomNames.add(name)
    return name
  }
}
