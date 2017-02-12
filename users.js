'use strict'

const names = new Set()

module.exports = {
  add(name) {
    names.add(name)
  },

  delete(name) {
    return names.delete(name)
  },

  has(name) {
    return names.has(name)
  },

  list() {
    return Array.from(names)
  },

  count() {
    return names.size
  },

  clear() {
    return names.clear()
  }
}
