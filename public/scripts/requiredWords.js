'use strict'

module.exports = {
  addWords(randomWords) {
    const requiredWordList = document.querySelector('#requiredWordsList')
    requiredWordList.innerHTML = ''
    for (const word of randomWords) {
      const item = document.createElement('li')
      item.className = 'requiredWord'
      item.appendChild(document.createTextNode(word))
      requiredWordList.appendChild(item)
    }
  }
}
