const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jsonContato = path.join(__dirname, '../dados/contato.json');

// Função para ler o JSON existente
function lerContato() {
    if (!fs.existsSync(jsonContato)) {
        fs.writeFileSync(jsonContato, JSON.stringify([]));
    }
    const data = fs.readFileSync(jsonContato, 'utf-8');
    return JSON.parse(data);
}

// Função para salvar os contatos
function salvarContato(contato) {
    const contatos = lerContato();
    contatos.push(contato);
    fs.writeFileSync(jsonContato, JSON.stringify(contatos, null, 2));
}

// Rota para receber os dados do formulário
router.post('/', (req, res) => {
    const { nome, email, telefone, mensagem } = req.body;

    if (!nome || !email || !telefone || !mensagem) {
        return res.status(400).json({
             sucesso: false, 
             mensagem: 'Preencha todos os campos.' 
            });
    }

    const novoContato = {
        nome,
        email,
        telefone,
        mensagem
    };

    try {
        salvarContato(novoContato);
        return res.status(200).json({ sucesso: true, mensagem: `Mensagem enviada com sucesso! Obrigado pelo contato, ${nome}.` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar a mensagem.' });
    }
});

module.exports = router;
