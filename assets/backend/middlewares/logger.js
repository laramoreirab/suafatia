const express = require('express')
const fs = require('fs')
const router = express.Router()

const logger = (req, res, next) =>{
    const data = new Date()
    console.log(`[${data.toISOString()}] - ${req.method} - ${req.url}`)
    next()
}

router.use(logger)

module.exports = router