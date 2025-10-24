const jwt = require('jsonwebtoken')
require('dotenv').config()

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' }) //verifica se há token
  }
  
  const token = authHeader.split(' ')[1] //retira o Bearer
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.userEmail = decoded.email
    next()
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' })
  }
}

module.exports = verificarToken