const express = require('express')
const fs = require('fs')
const app = express()
const cors = require('cors')
const port = 3000
const rotaCadastro = require('./rotas/rotaCadastro')
const rotaLogin = require('./rotas/rotaLogin')
const rotaCarrinho = require('./rotas/rotaCarrinho')
const logger = require('./middlewares/logger')

app.use(cors({
  origin: 'http://localhost:5500'
}));

app.use(express.json()) // middleware para ler arquivo json

app.use(logger)

app.use('/cadastro', rotaCadastro)

app.use('/login', rotaLogin)

app.use('/carrinho', rotaCarrinho)

app.get('/', (req, res) => {
    res.status(200).send('Página Inicial')
})

app.listen(port, () =>{
    console.log(`Servidor rodando em http://localhost:${port}`)
})