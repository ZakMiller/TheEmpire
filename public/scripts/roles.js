const roles = {
  human: {
    image: 'https://s-media-cache-ak0.pinimg.com/originals/e0/f8/41/e0f84168cde4123e1e5aec348364a017.jpg',
    name: 'Human',
    description: "You can say whatever you want, but be careful! If the robots figure out you're human it 's all over!"
  },
  AI: {
    image: 'http://www.popsci.com/sites/popsci.com/files/styles/large_1x_/public/images/2014/11/robot-friend-popular-science.jpg?itok=bX08qSI7',
    name: 'AI',
    description: "Your programming dictates that you have to use three out of the ten 'special' words, but be careful! If the judge thinks you're the worst AI it's all over!"
  }
}

module.exports = {
  getRole(name) {
    return roles[name]
  }

}
