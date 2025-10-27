const express = require('express')
const fs = require('fs').promises
const verificarToken = require('../middlewares/autenticacao')
const router = express.Router()

// GET - Buscar carrinho do usuário autenticado
router.get('/', verificarToken, async (req, res) => {
    try {
        const userId = req.userId // Vem do middleware
        
        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)
        
        const carrinho = carrinhos.find(c => c.usuarioId === userId)
        
        res.json(carrinho || { usuarioId: userId, itens: [], total: 0 })
        
    } catch (erro) {
        console.error('Erro ao buscar carrinho:', erro)
        return res.status(500).json({ erro: 'Erro ao buscar carrinho' })
    }
})


// POST - Adicionar item ao carrinho 
router.post('/adicionar', verificarToken, async (req, res) => {
    try {
        const userId = req.userId; // Vem do token JWT
        const { id, quantidade, nome, preco, imagem } = req.body;

        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)
        
        let carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        
        // Se o usuário ainda não tem carrinho, cria um novo
        if (!carrinhoUsuario) {
            carrinhoUsuario = { usuarioId: userId, itens: [] }
            carrinhos.push(carrinhoUsuario)
        }

        const itemExistente = carrinhoUsuario.itens.find(item => item.id === id)
      
        if (itemExistente) {
            itemExistente.quantidade += parseInt(quantidade)
        } else {
            carrinhoUsuario.itens.push({
                id,
                quantidade: parseInt(quantidade),
                nome,
                preco,
                imagem
            })
        }
    
        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))
        
        return res.status(200).json({ 
            message: 'Item adicionado ao carrinho com sucesso!',
            carrinho: carrinhoUsuario 
        })
        
    } catch (erro) {
        console.error('Erro ao adicionar item:', erro)
        return res.status(500).json({ erro: 'Erro ao adicionar item' })
    }
})

// POST - Adicionar item Personalizaado ao carrinho 
router.post('/adicionar/personalize', verificarToken, async (req, res) => {
    try {
        const userId = req.userId; // Vem do token JWT
        const pedido = req.body;

        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)
        
        let carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        
        // Se o usuário ainda não tem carrinho, cria um novo
        if (!carrinhoUsuario) {
            carrinhoUsuario = { usuarioId: userId, itens: [] }
            carrinhos.push(carrinhoUsuario)
        }

        const itemExistente = carrinhoUsuario.itens.find(item => item.id === id)
      
        if (itemExistente) {
            itemExistente.quantidade += parseInt(quantidade)
        } else {
            carrinhoUsuario.itens.push({
                pedido
            })
        }
    
        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))
        
        return res.status(200).json({ 
            message: 'Item adicionado ao carrinho com sucesso!',
            carrinho: carrinhoUsuario 
        })
        
    } catch (erro) {
        console.error('Erro ao adicionar item:', erro)
        return res.status(500).json({ erro: 'Erro ao adicionar item' })
    }
})


// PUT - Atualizar quantidade de um item no carrinho
router.put('/atualizar/:itemId', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const itemId = req.params.itemId
        const { quantidade } = req.body

        if (!quantidade || quantidade < 1) {
            return res.status(400).json({ erro: 'Quantidade inválida' })
        }

        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)

        const carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        if (!carrinhoUsuario) {
            return res.status(404).json({ erro: 'Carrinho não encontrado' })
        }

        const item = carrinhoUsuario.itens.find(i => i.id === itemId)
        if (!item) {
            return res.status(404).json({ erro: 'Item não encontrado' })
        }

        // Atualiza a quantidade
        item.quantidade = parseInt(quantidade)

        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))

        return res.status(200).json({
            message: 'Quantidade atualizada com sucesso!',
            carrinho: carrinhoUsuario
        })
    } catch (erro) {
        console.error('Erro ao atualizar item:', erro)
        return res.status(500).json({ erro: 'Erro ao atualizar item' })
    }
})


// DELETE - Remover item do carrinho
router.delete('/remover/:itemId', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const itemId = req.params.itemId

        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)

        const carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        if (!carrinhoUsuario) {
            return res.status(404).json({ erro: 'Carrinho não encontrado' })
        }

        const itemExiste = carrinhoUsuario.itens.find(i => i.id === itemId)
        if (!itemExiste) {
            return res.status(404).json({ erro: 'Item não encontrado no carrinho' })
        }

        // Remove o item
        carrinhoUsuario.itens = carrinhoUsuario.itens.filter(i => i.id !== itemId)

        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))

        return res.status(200).json({
            message: 'Item removido com sucesso!',
            carrinho: carrinhoUsuario
        })
    } catch (erro) {
        console.error('Erro ao remover item:', erro)
        return res.status(500).json({ erro: 'Erro ao remover item' })
    }
})


module.exports = router
