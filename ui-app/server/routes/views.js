const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log(new Date().toTimeString())
  next()
})
// define the home page route
router.get('/', (req, res) => {
  res.send({name: 'Hello World'})
})

module.exports = router