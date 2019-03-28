class CookieControl {
  constructor () {
    this.tokenArr = []
  }
  getToken () {
    let token = ''
    let str = '123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    for (let i=0; i<16; i++) {
      if (i%4 ===0 && i !== 0) {
        token += '-'
      }
      token += str[parseInt(Math.random() * str.length)]
    }
    this.tokenArr.push(token)
    return token
  }
  checkToken (token) {
    if (this.tokenArr.includes(token)) {
      return true
    }
    return false
  }
  removeToken (token) {
    for (let i=0; i<this.tokenArr; i++) {
      if (this.tokenArr[i] === token) {
        this.tokenArr.splice(i, 1)
        return true
      }
    }
    return false
  }
}

module.exports = CookieControl