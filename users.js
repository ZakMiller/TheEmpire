'use strict'

// const names = new Set()
let names = []
const votes = {}

module.exports = {
  add(name, id) {
    const element = {
      name: name,
      id: id
    }
    names.push(element)
    // votes = 0
  },

  delete(name) {
    const deleted = names.filter(function(element) {
      return element.name !== name
    })
    names = deleted
  },

  has(name) {
    for (let i = 0; i < names.length; i++) {
      if (names[i].name === name) {
        return true
      }
    }
    return false
  },

  list() {
    return names
  },

  names() {
    return names.map(function(element) {
      return element.name
    })
  },

  count() {
    return names.length
  },

  clear() {
    names = []
  },

  getNameFromID(id) {
    const userWithID = names.filter(function(element) {
      return element.id === id
    })
    return userWithID[0].name
  },

  vote(name) {
    // votes[name] += 1
  },

  getMostVoted() {
    // let mostVotes = 0
    // let mostVoted
    // for (let i = 0; i < names.length; i++) {
    // if (names[i].votes > mostVotes) {
    //  mostVotes = votes[i]
    //  mostVoted = names[i]
    //   }
    //  }
    // / return mostVoted
  }
}
