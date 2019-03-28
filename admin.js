const express = require('express')  //引入express模块
const router = express.Router() // 功能和app一样
const urlencodeParser = require('body-parser').urlencoded({extended: false})
const moment = require('moment')
const MongoControl = require('./utils/databasecontrol').MongoControl
const path = require('path')

// 引入cookie管理模块
const CookieControl = require('./cookie')

const admin = new CookieControl()

const page = new MongoControl('blog', 'page')
const comment = new MongoControl('blog', 'comment')

// /uploadPage上传文章

router.get('/', (req, res) => {
  // if (req.cookies.token === token) {
  if (admin.checkToken(req.cookies.token)) {
    res.sendFile(path.resolve('./static/admin.html'))
  } else {
    // res.write(`你的权限不足,${delay}秒后返回登录页`)
    // todo: 等待ms后返回首页
    // res.redirect('/admin/login')
    res.sendFile(path.resolve('./static/backtohome.html'))
  }
})

router.get('/login', (req, res) => {
  res.sendFile(path.resolve('./static/login.html'))
})

router.post('/login', urlencodeParser, (req, res) => {
  let { username, password } = req.body
  if (username === 'admin' && password === '000000') {
    // res.cookie('token', token)
    res.cookie('token', admin.getToken())
    // res.send('登录成功')
    res.redirect('/admin')
  } else {
    // res.status(403).send('登录失败')
    // res.redirect('/admin/login')
    res.sendFile(path.resolve('./static/backtohome.html'))
  }
})

router.post('/uploadPage', urlencodeParser, (req, res) => {

  // if (req.cookies.token === token) {
  if (admin.checkToken(req.cookies.token)) {

  } else {
    // res.status(403).send('你的权限不足')
    // res.redirect('/admin/login')
    res.sendFile(path.resolve('./static/backtohome.html'))
    return
  }

  let { sort, title, author, content, intro } = req.body
  let now = moment().format('YYYY-MM-DD HH:mm:ss')
  page.insert({
    sort, title, author, content, intro, date: now
  }, (err, result) => {
    if (err) {
      console.log(err)
      return
    }
    // res.send('文章发表成功')
    res.redirect('/admin')
  })

})

// 评论相关节口
// getComment 接口
router.get('/getComment', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (admin.checkToken(req.cookies.token)) {

  } else {
    res.status(404).send('权限不足，请返回首页')
    return
  }
  comment.find({state: 0}, (err, data) => {
    let count = 0
    if (data.length === 0) {
      res.send([])
      return
    } 
    for (let i=0; i<data.length; i++) {
      page.findById(data[i].fid, function (err, result) {
        var page = result[0]
        // 父文章标题
        data[i].f_title = page.title
        data[i].f_intro = page.intro
        count++
        if (count === data.length) {
          res.send(data)
        }
      })
  }
  })
})

router.get('/passComment', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (admin.checkToken(req.cookies.token)) {

  } else {
    res.status(404).send('权限不足，请返回首页')
    return
  }
  let {_id} = req.query
  comment.updateById(_id, {state: 1}, (err, result) => {
    res.send({
      result: 'ok'
    })
  })
})

router.get('/denyComment', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (admin.checkToken(req.cookies.token)) {

  } else {
    res.status(404).send('权限不足，请返回首页')
    return
  }
  let {_id} = req.query
  comment.updateById(_id, {state: 2}, (err, result) => {
    res.send({
      result: 'ok'
    })
  })
})

module.exports = router