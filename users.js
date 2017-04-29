'use strict'

let users = {}

module.exports = {
  add(name, id) {
    users[name] = {
      id: id,
      votes: 0
    }
  },

  delete(name) {
    delete users[name]
  },

  has(name) {
    return users.hasOwnProperty(name)
    // do stuff
  },

  getId(name) {
    if (this.has(name)) {
      return users[name].id
    } else {
      return null
    }
  },

  list() {
    return users
  },

  names() {
    return Object.keys(users)
  },

  count() {
    return Object.keys(users).length
  },

  clear() {
    users = {}
  },

  getNameFromID(id) {
    for (var name in users) {
      if (users[name].id === id) {
        return name
      }
    }
  },

  vote(name) {
    if (this.has(name)) {
      users[name].votes += 1
    }
  },

  getMostVoted() {
    let mostVotes = 0
    let mostVoted
    for (const name in users) {
      const user = users[name]
      if (user.votes > mostVotes) {
        mostVotes = user.votes
        mostVoted = name
      }
    }
    return mostVoted
  }
}
