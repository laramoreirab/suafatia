const express = require('express')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') 
const router = express.Router()
require('dotenv').config()

router.post('/', async (req,res)=>{
    const {email, senha} = req.body
    if(!email || !senha){
        return res.status(400).json({erro: 'Todos os campos são obrigatórios'})
    }

      if (!email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' })
  }

    fs.readFile('./dados/users.json', 'utf8', async (err, data) => {
        if (err) {
        console.error('Erro ao ler arquivo de usuários:', err)
        return res.status(500).json({ erro: 'Erro ao ler arquivo!' })
        }

        try {
        const dataJson = JSON.parse(data)
        const usuario = dataJson.find(user => user.email === email)

        if (!usuario) {
            return res.status(400).json({ erro: 'Email ou senha inválidos!' })
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
        if (!senhaCorreta) {
            return res.status(400).json({ erro: 'Email ou senha inválidos!' })
        }

        // Criar token JWT
        const payload = {
            userId: usuario.id,
            email: usuario.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

        // Criar objeto do carrinho
        const contCarrinho = {
            usuarioId: usuario.id,
            itens: []
        }

        // Atualizar carrinho.json
        fs.readFile('./dados/carrinho.json', 'utf8', (err, dataCarrinho) => {
            if (err) {
            console.error('Erro ao ler arquivo de carrinho:', err)
            return res.status(500).json({ erro: 'Erro ao ler arquivo do carrinho!' })
            }

            try {
            const dados_carrinho = JSON.parse(dataCarrinho)

            // Evitar duplicar carrinho se já existir
            const jaTemCarrinho = dados_carrinho.some(
                carrinho => carrinho.usuarioId === usuario.id
            )

            if (!jaTemCarrinho) {
                dados_carrinho.push(contCarrinho)
            }

            fs.writeFile(
                './dados/carrinho.json',
                JSON.stringify(dados_carrinho, null, 2),
                err => {
                if (err) {
                    console.error('Erro ao salvar carrinho:', err)
                    return res
                    .status(500)
                    .json({ erro: 'Erro ao adicionar carrinho do usuário' })
                }

                return res.status(200).json({
                    message: 'Login realizado com sucesso!',
                    usuario: {
                    id: usuario.id,
                    email: usuario.email
                    },
                    token
                })
                }
            )
            } catch (parseErr) {
            console.error('Erro ao processar JSON do carrinho:', parseErr)
            return res.status(500).json({ erro: 'Erro ao processar dados do carrinho' })
            }
        })
        } catch (parseErr) {
        console.error('Erro ao processar JSON de usuários:', parseErr)
        return res.status(500).json({ erro: 'Erro ao processar dados' })
        }
    })
    })

router.options('/',(req,res)=>{
    res.header('Allow','POST','OPTIONS')
    res.status(204).send()
})

module.exports = router
