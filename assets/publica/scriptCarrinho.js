// Verifica se está logado
function verificarLogin() {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Você precisa fazer login para acessar o carrinho!')
        window.location.href = 'login.html'
        return false
    }
    return true
}

// Buscar carrinho do usuário
async function carregarCarrinho() {
    if (!verificarLogin()) return
    
    const token = localStorage.getItem('token')
    
    try {
        const response = await fetch('http://localhost:3000/carrinho', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        if (response.ok) {
            const carrinho = await response.json()
            exibirCarrinho(carrinho)
        } else if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.')
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            window.location.href = 'login.html'
        } else {
            console.error('Erro ao carregar carrinho')
        }
    } catch (erro) {
        console.error('Erro:', erro)
        alert('Erro ao carregar carrinho')
    }
}

// Exibir itens do carrinho na tela
function exibirCarrinho(carrinho) {
    const containerItens = document.querySelector('.contcompras')
    
    if (!carrinho.itens || carrinho.itens.length === 0) {
        containerItens.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: var(--montserrat_fonte);">
                <h3>Seu carrinho está vazio!</h3>
                <p>Adicione pizzas deliciosas!</p>
                <a href="cardapio.html"><button style="margin-top: 20px; padding: 10px 20px; border-radius: 5px; border: none; background-color: #891515; color: white; cursor: pointer; font-family: var(--montserrat_fonte);">Ver Cardápio</button></a>
            </div>
        `
        atualizarResumo(carrinho)
        return
    }
    
    // Limpa container
    containerItens.innerHTML = ''
    
    // Adiciona cada item
    carrinho.itens.forEach((item) => {
        // Verifica se é pizza personalizada (nova estrutura)
        const isPizzaPersonalizada = item.tipo === 'pizza_personalizada'
        
        // Define dados do item baseado na estrutura correta
        const itemId = item.id
        const itemNome = item.nome
        const itemPreco = item.preco
        const itemQuantidade = item.quantidade
        const itemImagem = item.imagem || '/assets/img/personalizacao/pizzapersona.png'
        
        const itemHTML = `
            <div class="produtos" data-item-id="${itemId}">
                <a href="#" class="excluir" data-item-id="${itemId}">X</a>
                <img src="${itemImagem}" alt="${itemNome}" class="imgproduto">
                <h6>${itemNome}</h6>
                <div class="qtdprodutos">
                    <a href="#" class="adicionar" data-item-id="${itemId}" data-quantidade="${itemQuantidade}">+</a>
                    <p class="quantidadeprod">${itemQuantidade}</p>
                    <a href="#" class="retirar" data-item-id="${itemId}" data-quantidade="${itemQuantidade}">-</a>
                </div>
                <div class="valorproduto"><b>R$ ${(itemPreco * itemQuantidade).toFixed(2).replace('.', ',')}</b></div>
            </div>
            <div class="detalhes">
                <h5><b>Detalhes</b></h5>
                ${isPizzaPersonalizada ? `
                    <p><strong>Tamanho:</strong> ${item.personalizacao.tamanho}</p>
                    <p><strong>Massa:</strong> ${item.personalizacao.massa}</p>
                    <p><strong>Queijo:</strong> ${item.personalizacao.queijo}</p>
                    ${item.personalizacao.recheio && item.personalizacao.recheio.length > 0 ? `<p><strong>Recheio:</strong> ${item.personalizacao.recheio.join(', ')}</p>` : ''}
                    ${item.personalizacao.cobertura && item.personalizacao.cobertura.length > 0 ? `<p><strong>Cobertura:</strong> ${item.personalizacao.cobertura.join(', ')}</p>` : ''}
                    ${item.personalizacao.observacoes ? `<p><strong>Observações:</strong> ${item.personalizacao.observacoes}</p>` : ''}
                ` : `
                    <p>Pizza do cardápio</p>
                `}
            </div>
            <hr class="lineproduto">
        `
        
        containerItens.innerHTML += itemHTML
    })
    
    // Adiciona event listeners
    adicionarEventListeners()
    
    // Atualiza resumo
    atualizarResumo(carrinho)
}

// Adiciona event listeners aos botões
function adicionarEventListeners() {
    // Botões de adicionar
    document.querySelectorAll('.adicionar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault()
            const itemId = e.target.dataset.itemId
            const quantidadeAtual = parseInt(e.target.dataset.quantidade)
            await alterarQuantidade(itemId, quantidadeAtual + 1)
        })
    })
    
    // Botões de retirar
    document.querySelectorAll('.retirar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault()
            const itemId = e.target.dataset.itemId
            const quantidadeAtual = parseInt(e.target.dataset.quantidade)
            await alterarQuantidade(itemId, quantidadeAtual - 1)
        })
    })
    
    // Botões de excluir
    document.querySelectorAll('.excluir').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault()
            const itemId = e.target.dataset.itemId
            if (confirm('Deseja remover este item do carrinho?')) {
                await removerItem(itemId)
            }
        })
    })
}

// Atualizar resumo do pedido
function atualizarResumo(carrinho) {
    const frete = 7.00
    
    // Calcula o subtotal somando todos os itens
    let subtotal = 0
    if (carrinho.itens && carrinho.itens.length > 0) {
        carrinho.itens.forEach(item => {
            subtotal += item.preco * item.quantidade
        })
    }
    
    const total = subtotal + frete
    
    // Atualiza valores no resumo
    const contextResumoContainer = document.querySelector('.cont-resumo')
    
    // Lista itens no resumo
    const itensResumo = carrinho.itens && carrinho.itens.length > 0 ? carrinho.itens.map(item => {
        return `
            <div class="context-resumo">
                <p class="nomeprod">${item.nome} (x${item.quantidade})</p>
                <p class="precoprodresumo">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
            </div>
        `
    }).join('') : '<p class="nomeprod" style="text-align: center;">Nenhum item</p>'
    
    // Reconstrói o resumo mantendo a estrutura
    const resumoAtualizado = `
        <hr class="prelineresumo">
        <h4><b>Resumo</b></h4>
        <hr class="line1resumo">
        ${itensResumo}
        <div class="context-resumo">
            <p class="textfrete">Frete de entrega</p>
            <p class="precofrete">R$ ${frete.toFixed(2).replace('.', ',')}</p>
        </div>
        <div class="context-resumo">
            <p class="subtotal">Subtotal</p>
            <p class="precosubtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
        </div>
        <hr class="line2resumo">
        <div class="context-resumo">
            <p class="total">Total</p>
            <p class="precototal"><b>R$ ${total.toFixed(2).replace('.', ',')}</b></p>
        </div>
        <a href="endereco.html" class="continuarcompra"><button class="continuar" ${carrinho.itens && carrinho.itens.length > 0 ? '' : 'disabled'}>Continuar</button></a>
    `
    
    contextResumoContainer.innerHTML = resumoAtualizado
    
    // Salva o resumo no localStorage para usar nas outras páginas
    localStorage.setItem('resumoCarrinho', JSON.stringify({
        itens: carrinho.itens,
        subtotal: subtotal,
        frete: frete,
        total: total
    }))
}

// Alterar quantidade de um item
async function alterarQuantidade(itemId, novaQuantidade) {
    if (novaQuantidade < 1) {
        if (confirm('Deseja remover este item do carrinho?')) {
            await removerItem(itemId)
        }
        return
    }
    
    const token = localStorage.getItem('token')
    
    try {
        const response = await fetch(`http://localhost:3000/carrinho/atualizar/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantidade: novaQuantidade })
        })
        
        if (response.ok) {
            carregarCarrinho() // Recarrega o carrinho
        } else {
            alert('Erro ao atualizar quantidade')
        }
    } catch (erro) {
        console.error('Erro:', erro)
        alert('Erro ao atualizar quantidade')
    }
}

// Remover item do carrinho
async function removerItem(itemId) {
    const token = localStorage.getItem('token')
    
    try {
        const response = await fetch(`http://localhost:3000/carrinho/remover/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        if (response.ok) {
            carregarCarrinho() // Recarrega o carrinho
        } else {
            alert('Erro ao remover item')
        }
    } catch (erro) {
        console.error('Erro:', erro)
        alert('Erro ao remover item')
    }
}

// Carrega o carrinho quando a página é aberta
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho()
})