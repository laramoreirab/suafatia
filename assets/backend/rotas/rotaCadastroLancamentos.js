const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../dados/cadastroLancamentos.json');

router.post('/', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'O campo de email é obrigatório' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    let lista = [];

    if (!err && data) {
      try {
        lista = JSON.parse(data);
      } catch (error) {
        console.error('Erro ao processar JSON:', error);
      }
    }

    // Verifica se o email já está cadastrado
    const existe = lista.find(item => item.email === email);
    if (existe) {
      return res.status(400).json({ erro: 'Este email já está cadastrado.' });
    }

    lista.push({ email });

    fs.writeFile(filePath, JSON.stringify(lista, null, 2), (err) => {
      if (err) {
        console.error('Erro ao salvar:', err);
        return res.status(500).json({ erro: 'Erro ao salvar o email.' });
      }

      return res.status(200).json({ message: 'Email cadastrado com sucesso!' });
    });
  });
});

module.exports = router;
