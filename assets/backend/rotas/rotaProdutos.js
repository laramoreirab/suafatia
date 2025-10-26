const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Caminhos base
const CAMINHO_JSON = path.join(__dirname, '../dados/produtos.json');
const CAMINHO_HTML = path.join(__dirname, '../../../informacoes.html'); 

router.get('/:id', async (req, res) => {
  try {
    const idProduto = parseInt(req.params.id);

    // --- Lê o JSON com os produtos ---
    const data = await fs.readFile(CAMINHO_JSON, 'utf-8');
    const produtos = JSON.parse(data);

    // --- Encontra o produto pelo ID ---
    const produto = produtos.find(p => p.id === idProduto);
    if (!produto) {
      return res.status(404).send('Produto não encontrado! ');
    }

    // --- Lê o HTML base ---
    let html = await fs.readFile(CAMINHO_HTML, 'utf-8');

    // --- Insere os dados do produto ---
    html = html.replace('</head>', `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelector('.titulo_informacoes').textContent = "${produto.nomeproduto}";
          document.querySelector('.descricao_informacoes').textContent = "${produto.descricao}";
          document.querySelector('.img_informacoes img').src = "${produto.imagem}";
          ${produto.preco ? `document.querySelector('.preco_informacoes').textContent = "R$ ${produto.preco}";` : ''}
        });
      </script>
    </head>`);

    // --- Envia o HTML renderizado ---
    res.send(html);
  } catch (erro) {
    console.error('Erro ao processar produto:', erro);
    res.status(500).send('Erro interno ao carregar produto! ');
  }
});

module.exports = router;