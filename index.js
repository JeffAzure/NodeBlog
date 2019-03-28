// 引入express模块
const express = require('express')  
// 初始化express模块的app
const app = express()               
// 引入body-parser
const bodyParser = require('body-parser')
// 初始化urlencoded解析器
const urlencodedParser = bodyParser.urlencoded({
  extended: false
})

// 引入cookie-parser模块
const cookieParser = require('cookie-parser')
// 引入自己实现的MongoControl模块
const MongoControl = require('./utils/databasecontrol').MongoControl
// const page = new MongoControl('page', 'main')
// 初始化文章的集合
const page = new MongoControl('blog', 'page')
// 初始化评论集合
const comment = new MongoControl('blog', 'comment')
// 引入ejs作后端渲染
const ejs = require('ejs')
// 引入moment模块处理时间格式
const moment = require('moment')

// 引入marked， 解析md为html
const marked = require('marked')

// app.all('*', function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin','*')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST') 
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')  
//   // res.setHeader("Content-Type", "application/json;charset=utf-8")
//   next();
// });

// 为请求添加中间件：解析cookie
app.use(cookieParser())

// 处理静态文件请求
app.use(express.static('./static', {
  index: false
}))

// 后台功能接口的静态文件请求
app.use('/admin', express.static('./static', {index: false}))
// 后台功能的路由
app.use('/admin', require('./admin'))

// 前台相关接口
// 首页接口
app.get('/', (req, res) => {
  // 在page的集合里查找全部文章
  page.find({}, (err, data) => {
    if (err) {
      console.log(err)
      return
    }
    // ejs渲染json文章数据到页面中
    ejs.renderFile('./ejs-tpl/index.ejs', {
      data
    }, (err, html) => {
      res.send(html)
    })
  })
})

// 文章浏览接口
app.get('/p', (req, res) => {
  // 根据_id查询文章
  // _id = req.query._id: 获取从前端传来的_id
  page.findById(_id = req.query._id, (err, result) => {
    if (err) {
      console.log(err)
      return
    }
    // 如果没有这篇文章则报404错误
    if (result.length === 0) {
      res.status(404).send(`你来到了我的秘密♂花园`)
      return
    }
    // 查询评论
    // 根据文章的_id查询相关评论
    let data = result[0]  //id查询只返回一条
    data.content = marked(data.content) // 使用marked处理md为html
    comment.find({
      fid: _id, state: 1
    }, (err, result) => {
      // 渲染
      if (err) {
        console.log(err)
        return
      }
      ejs.renderFile('./ejs-tpl/page.ejs', {
        data,
        comment: result
      }, (err, html) => {
        res.send(html)
      })
    })

  })
})


// 前台用户提交评论接口
app.post('/submitComment', urlencodedParser, (req, res) => {
  // 获取携带在url中的文章_id
  let _id = req.query._id
  // 获取传过来的评论的email和内容
  let {
    email,
    content
  } = req.body
  // console.log(_id, email, content)

  // 简单的表单验证： 不允许参数为空
  if (!_id) {
    res.status(404).send('评论失败')
    return
  }
  if (!email || !content) {
    res.status(404).send('评论失败')
    return
  }
  comment.insert({
    fid: _id,
    author: email,
    content,
    date: moment().format('YYYY-MM-DD HH:mm:ss'),
    state: 0
  }, (err, result) => {
    if (err) {
      // 如果数据库操作失败则返500
      res.status(500).send('服务器崩溃')
      return
    }
    // 成功则重定向到文章
    res.redirect(`/p?_id=${_id}`)
  })

})

// // 后台程序相关的接口
// app.get('/admin') // 获取后台管理页面 => 发表文章、审核评论
// app.post('/admin/submitPage')
// app.post('/admin/inspectComment')

// 监听3000端口
app.listen(3000)