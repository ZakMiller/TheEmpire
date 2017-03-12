'use strict'

// const names = new Set()
let names = {}
const votes = {}

module.exports = {
  add(name, id) {
    names[name] = {
      id: id
    }
    // votes = 0
  },

  delete(name) {
    delete names[name]
  },

  has(name) {
    return names.hasOwnProperty(name)
    // do stuff
  },

  list() {
    return names
  },

  names() {
    return Object.keys(names)
  },

  count() {
    return Object.keys(names).length
  },

  clear() {
    names = {}
  },

  getNameFromID(id) {
    for (var name in names) {
      if (names[name].id === id) {
        return name
      }
    }
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
