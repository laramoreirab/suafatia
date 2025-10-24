const express = require('express')
const fs = require('fs')
const bcrypt = require('bcryptjs')
const router = express.Router()

router.post('/', (req, res) => { 
    const { email, usuario, senha } = req.body
    if (!email || !usuario || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' })
    }
    
    fs.readFile('./dados/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo:', err)
            return res.status(500).json({ erro: 'Erro ao ler arquivo!' })
        }
        try {
            const dataJson = JSON.parse(data)
            const verifica_email = dataJson.find(user => user.email === email)
            const verifica_usuario = dataJson.find(user => user.usuario === usuario)
            
            if (verifica_email) {
                return res.status(400).json({ erro: "Esse email já está cadastrado!" })
            }
            
            if (verifica_usuario) {
                return res.status(400).json({ erro: "Esse nome de usuário já foi escolhido!" })
            }
            
            // Criptografar senha
            bcrypt.hash(senha, 10, (err, senhaCripto) => {
                if (err) {
                    console.error('Erro ao criptografar senha:', err)
                    return res.status(500).json({ erro: 'Erro ao processar senha' })
                }
                
                const novoUser = {
                    id: Date.now().toString(),
                    email,
                    usuario,
                    senha: senhaCripto,
                }
                
                dataJson.push(novoUser)
                
                fs.writeFile('./dados/users.json', JSON.stringify(dataJson, null, 2), (err) => {
                    if (err) {
                    console.error('Erro ao salvar arquivo:', err)
                    return res.status(500).json({ erro: "Erro ao adicionar novo usuário" })
                }
                return res.status(200).json({ message: "Usuário cadastrado com sucesso!" })
                }) 
            }) 
            
        } catch (parseErr) {
            console.error('Erro ao processar JSON:', parseErr)
            return res.status(500).json({ erro: 'Erro ao processar dados' })
        } 
    })
}) 

router.options('/',(req,res)=>{
    res.header('Allow','POST','OPTIONS')
    res.status(204).send()
})

module.exports = router