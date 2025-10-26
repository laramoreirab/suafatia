const express = require('express')
const fs = require('fs')
const verificarToken = require('../middlewares/autenticacao')
const router = express.Router()

router.get('/', verificarToken, (req,res)=>{
    const userId = req.userId

    const carrinho = carrinhos.find(c => c.usuarioId === userId)

    res.json(carrinho || { itens: [] })
})

router.post('/adicionar', verificarToken, (req,res)=>{
    const userId = req.userId

    //continuar dps rota carrinho
})
module.exports = router