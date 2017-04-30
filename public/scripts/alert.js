'use strict'

const notifications = document.querySelector('#notifications')
let timeoutReference
const ONE_SECOND = 1000

module.exports =
  function alert(message, error = false, delayInSeconds = 5) {
    if (delayInSeconds > 0) {
      if (error) {
        notifications.style.color = 'red'
      } else {
        notifications.style.color = 'white'
      }
      notifications.textContent = message
      notifications.style.display = 'flex'

      timeoutReference = setTimeout(() => {
        notifications.style.display = 'none'
      }, ONE_SECOND)
    }
  }
