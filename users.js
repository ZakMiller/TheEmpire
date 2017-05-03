'use strict'

module.exports =
  class Users {
    constructor() {
      this.users = {}
    }

    add(name, id) {
      this.users[name] = {
        id: id,
        votes: 0
      }
    }

    delete(name) {
      delete this.users[name]
    }

    has(name) {
      return this.users.hasOwnProperty(name)
      // do stuff
    }

    getId(name) {
      if (this.has(name)) {
        return this.users[name].id
      } else {
        return null
      }
    }

    list() {
      return this.users
    }

    names() {
      return Object.keys(this.users)
    }

    count() {
      return Object.keys(this.users).length
    }

    clear() {
      this.users = {}
    }

    getNameFromID(id) {
      for (var name in this.users) {
        if (this.users[name].id === id) {
          return name
        }
      }
    }

    vote(name) {
      if (this.has(name)) {
        this.users[name].votes += 1
      }
    }

    getMostVoted() {
      let mostVotes = 0
      let mostVoted
      for (const name in this.users) {
        const user = this.users[name]
        if (user.votes > mostVotes) {
          mostVotes = user.votes
          mostVoted = name
        }
      }
      return mostVoted
    }
  }
