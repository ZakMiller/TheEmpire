class Role {
  constructor(image, name, description) {
    this.image = image
    this.name = name
    this.description = description
  }
}
module.exports = {
  getHumanRole() {
    const image = 'https://s-media-cache-ak0.pinimg.com/originals/e0/f8/41/e0f84168cde4123e1e5aec348364a017.jpg'
    const name = 'Human'
    const description = "You can say whatever you want, but be careful! If the robots figure out you're human it's all over!"
    const human = new Role(image, name, description)
    return human
  },

  getAIRole() {
    const image = 'http://www.popsci.com/sites/popsci.com/files/styles/large_1x_/public/images/2014/11/robot-friend-popular-science.jpg?itok=bX08qSI7'
    const name = 'AI'
    const description = "Your programming dictates that you have to use three out of the ten 'special' words,\
    but be careful! If the judge thinks you're the worst AI it's all over!"
    const AI = new Role(image, name, description)
    return AI
  }
}
