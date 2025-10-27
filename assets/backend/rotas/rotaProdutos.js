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
    const scriptContent = `
      // Dados do produto
      const produtoAtual = ${JSON.stringify({
        id: produto.id,
        nome: produto.nomeproduto,
        descricao: produto.descricao,
        preco: produto.preco,
        imagem: produto.imagem
      })};

      document.addEventListener('DOMContentLoaded', function() {
        // Preenche os dados na página
        if (document.querySelector('.titulo_informacoes')) {
          document.querySelector('.titulo_informacoes').textContent = produtoAtual.nome;
        }
        if (document.querySelector('.descricao_informacoes')) {
          document.querySelector('.descricao_informacoes').textContent = produtoAtual.descricao;
        }
        if (document.querySelector('.img_informacoes img')) {
          document.querySelector('.img_informacoes img').src = produtoAtual.imagem;
        }
        if (produtoAtual.preco && document.querySelector('.preco_informacoes')) {
          document.querySelector('.preco_informacoes').textContent = 'R$ ' + produtoAtual.preco;
        }
        
        // Adiciona evento ao botão de adicionar ao carrinho
        const botaoAdicionar = document.querySelector('.ddcarrinho_informacoes');
        if (botaoAdicionar) {
          botaoAdicionar.addEventListener('click', async function() {
            const inputQuantidade = document.getElementById('quantidade-input').value;
            const quantidade = inputQuantidade ? parseInt(inputQuantidade.value) || 1 : 1;
            const usuarioId = localStorage.getItem('id');
            
            if (!usuarioId) {
              alert('Por favor, faça login para adicionar itens ao carrinho');
              return;
            }

            try {
              const resposta = await fetch('http://localhost:3000/carrinho/adicionar', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  usuarioId: usuarioId,
                  id: produtoAtual.id,
                  nome: produtoAtual.nome,
                  preco: produtoAtual.preco,
                  imagem: produtoAtual.imagem,
                  quantidade: quantidade
                })
              });
              
              const resultado = await resposta.json();
              
              if (resposta.ok) {
                alert('Produto adicionado ao carrinho!');
              } else {
                alert('Erro: ' + resultado.erro);
              }
            } catch (erro) {
              console.error('Erro:', erro);
              alert('Erro ao adicionar produto ao carrinho');
            }
          });
        }
      });
    `;

    // --- Insere o script no HTML ---
    html = html.replace('</head>', `<script>${scriptContent}</script></head>`);

    // --- Envia o HTML renderizado ---
    res.send(html);
  } catch (erro) {
    console.error('Erro ao processar produto:', erro);
    res.status(500).send('Erro interno ao carregar produto! ');
  }
});

module.exports = router;