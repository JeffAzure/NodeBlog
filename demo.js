const express = require('express')
let app = express()


app.use('/admin', require('./admin'))

app.get('/', (req, res) => {
  res.send('index')
})

app.listen(3001)