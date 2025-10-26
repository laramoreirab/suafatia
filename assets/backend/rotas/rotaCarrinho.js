const express = require('express')
const fs = require('fs').promises
const verificarToken = require('../middlewares/autenticacao')
const router = express.Router()

// GET - Buscar carrinho do usuário autenticado
router.get('/', verificarToken, async (req, res) => {
    try {
        const userId = req.userId // Vem do middleware
        
        // Lê o arquivo carrinho.json
        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        const carrinhos = JSON.parse(data)
        
        // Busca o carrinho do usuário
        const carrinho = carrinhos.find(c => c.usuarioId === userId)
        
        // Se encontrou, retorna. Se não, retorna vazio
        res.json(carrinho || { usuarioId: userId, itens: [], total: 0 })
        
    } catch (erro) {
        console.error('Erro ao buscar carrinho:', erro)
        return res.status(500).json({ erro: 'Erro ao buscar carrinho' })
    }
})

// POST - Adicionar item ao carrinho 
router.post('/adicionar', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const novoItem = req.body
        
        // Validação
        if (!novoItem.nome || !novoItem.preco) {
            return res.status(400).json({ erro: 'Nome e preço são obrigatórios' })
        }
        
        // Lê o arquivo
        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        let carrinhos = JSON.parse(data)
        
        // Procura carrinho do usuário
        let carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        
        if (!carrinhoUsuario) {
            // Cria novo carrinho
            carrinhoUsuario = {
                usuarioId: userId,
                itens: [],
                total: 0,
                dataAtualizacao: new Date().toISOString()
            }
            carrinhos.push(carrinhoUsuario)
        }
        
        // Adiciona ID único ao item se não tiver
        if (!novoItem.id) {
            novoItem.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        
        // Quantidade padrão
        if (!novoItem.quantidade) {
            novoItem.quantidade = 1
        }
        
        // Adiciona o item
        carrinhoUsuario.itens.push(novoItem)
        
        // Recalcula o total
        carrinhoUsuario.total = carrinhoUsuario.itens.reduce(
            (soma, item) => soma + (parseFloat(item.preco) * item.quantidade), 
            0
        )
        
        carrinhoUsuario.dataAtualizacao = new Date().toISOString()
        
        // Salva
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

// PUT - Atualizar quantidade
router.put('/atualizar/:itemId', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const itemId = req.params.itemId
        const { quantidade } = req.body
        
        if (!quantidade || quantidade < 1) {
            return res.status(400).json({ erro: 'Quantidade inválida' })
        }
        
        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        let carrinhos = JSON.parse(data)
        
        const carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        
        if (!carrinhoUsuario) {
            return res.status(404).json({ erro: 'Carrinho não encontrado' })
        }
        
        const item = carrinhoUsuario.itens.find(i => i.id === itemId)
        
        if (!item) {
            return res.status(404).json({ erro: 'Item não encontrado' })
        }
        
        // Atualiza
        item.quantidade = quantidade
        
        // Recalcula total
        carrinhoUsuario.total = carrinhoUsuario.itens.reduce(
            (soma, item) => soma + (parseFloat(item.preco) * item.quantidade), 
            0
        )
        
        carrinhoUsuario.dataAtualizacao = new Date().toISOString()
        
        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))
        
        return res.status(200).json({ 
            message: 'Quantidade atualizada!',
            carrinho: carrinhoUsuario 
        })
        
    } catch (erro) {
        console.error('Erro ao atualizar:', erro)
        return res.status(500).json({ erro: 'Erro ao atualizar' })
    }
})

// DELETE - Remover item
router.delete('/remover/:itemId', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const itemId = req.params.itemId
        
        const data = await fs.readFile('./dados/carrinho.json', 'utf8')
        let carrinhos = JSON.parse(data)
        
        const carrinhoUsuario = carrinhos.find(c => c.usuarioId === userId)
        
        if (!carrinhoUsuario) {
            return res.status(404).json({ erro: 'Carrinho não encontrado' })
        }
        
        // Remove o item
        carrinhoUsuario.itens = carrinhoUsuario.itens.filter(i => i.id !== itemId)
        
        // Recalcula
        carrinhoUsuario.total = carrinhoUsuario.itens.reduce(
            (soma, item) => soma + (parseFloat(item.preco) * item.quantidade), 
            0
        )
        
        carrinhoUsuario.dataAtualizacao = new Date().toISOString()
        
        await fs.writeFile('./dados/carrinho.json', JSON.stringify(carrinhos, null, 2))
        
        return res.status(200).json({ 
            message: 'Item removido!',
            carrinho: carrinhoUsuario 
        })
        
    } catch (erro) {
        console.error('Erro ao remover:', erro)
        return res.status(500).json({ erro: 'Erro ao remover' })
    }
})
module.exports = router