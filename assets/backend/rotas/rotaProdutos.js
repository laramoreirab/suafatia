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

        // === ADICIONAR AO CARRINHO COM AUTENTICAÇÃO ===
          const btnAdicionar = document.querySelector('.addcarrinho_informacoes');
          const inputQuantidade = document.getElementById('quantidade-input');

          btnAdicionar.addEventListener('click', async () => {
            // Verifica se está logado
            const token = localStorage.getItem('token');
            if (!token) {
              alert('Você precisa fazer login para adicionar ao carrinho!');
              window.location.href = 'http://localhost:5500/login.html';
              return;
            }

            // Pega a quantidade
            const quantidade = parseInt(inputQuantidade.value) || 1;

            // Monta o objeto do produto
            const itemCarrinho = {
              id: 'prod_' + produtoAtual.id + '_' + Date.now(),
              nome: produtoAtual.nome,
              preco: produtoAtual.preco,
              quantidade: quantidade,
              imagem: produtoAtual.imagem,
              tipo: 'pizza_pronta'
            };

            try {
              const response = await fetch('http://localhost:3000/carrinho/adicionar', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(itemCarrinho)
              });

              const resultado = await response.json();

                if (response.ok) {
                alert('✅ ' + resultado.message);
                // Reseta quantidade
                inputQuantidade.value = 1;
              } else {
                if (response.status === 401) {
                  alert('Sessão expirada. Faça login novamente.');
                  localStorage.removeItem('token');
                  localStorage.removeItem('usuario');
                  window.location.href = 'http://localhost:5500/login.html';
                } else {
                  alert('Erro: ' + resultado.erro);
                }
              }
            } catch (erro) {
              console.error('Erro:', erro);
              alert('Erro ao adicionar ao carrinho');
            }
          });
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