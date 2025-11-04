// Script para gerenciar estado de login no header
function verificarEExibirLogout() {
    const token = localStorage.getItem('token')
    const iconesDiv = document.querySelector('.icones')
    
    if (!iconesDiv) return
    
    if (token) {
        // Usuário está logado - mostra botão de logout
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
        
        // Remove o ícone de login se existir
        const loginIcon = iconesDiv.querySelector('.material-symbols-outlined:not(.bagshop)')
        if (loginIcon && loginIcon.textContent.includes('account_circle')) {
            loginIcon.remove()
        }
        
        // Verifica se o botão de logout já existe
        if (!iconesDiv.querySelector('.logout-btn')) {
            // Adiciona botão de logout
            const logoutHTML = `
                <span class="material-symbols-outlined logout-btn headerlink" 
                      style="cursor: pointer; position: relative;" 
                      title="Fazer logout">
                    logout
                </span>
            `
            iconesDiv.insertAdjacentHTML('beforeend', logoutHTML)
            
            // Adiciona evento de clique
            const logoutBtn = iconesDiv.querySelector('.logout-btn')
            logoutBtn.addEventListener('click', fazerLogout)
        }
    } else {
        // Usuário não está logado - remove botão de logout se existir
        const logoutBtn = iconesDiv.querySelector('.logout-btn')
        if (logoutBtn) {
            logoutBtn.remove()
        }
    }
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        // Remove dados do localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        localStorage.removeItem('resumoCarrinho')
        
        // Redireciona para a página inicial
        window.location.href = 'index.html'
    }
}

async function buscarCarrinhoDoBackend() {
    const token = localStorage.getItem('token')
    
    // Se não está logado, retorna 0
    if (!token) return 0
    
    try {
        const response = await fetch('http://localhost:3000/carrinho', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        if (response.ok) {
            const carrinho = await response.json()
            
            // Conta os itens
            let totalItens = 0
            
            if (carrinho.itens && carrinho.itens.length > 0) {
                carrinho.itens.forEach(item => {
                    // Verifica se é pizza personalizada
                    if (item.pedido && item.pedido.quantidade) {
                        totalItens += item.pedido.quantidade
                    } else if (item.quantidade) {
                        // Item normal
                        totalItens += item.quantidade
                    }
                })
            }
            
            return totalItens
        }
        
        return 0
    } catch (erro) {
        console.error('Erro ao buscar carrinho:', erro)
        return 0
    }
}

async function atualizarContador() {
    const iconesDiv = document.querySelector('.icones')
    if (!iconesDiv) return
    
    const iconeCarrinho = iconesDiv.querySelector('.bagshop')
    if (!iconeCarrinho) return

    // MUDANÇA AQUI: busca do backend ao invés do localStorage
    const totalItens = await buscarCarrinhoDoBackend()
    
    let contador = iconeCarrinho.querySelector('.contador-carrinho')
    
    if (totalItens === 0) {
        if (contador) contador.remove()
        return
    }
    
    if (!contador) {
        contador = document.createElement('span')
        contador.classList.add('contador-carrinho')
        Object.assign(contador.style, {
            position: 'absolute',
            top: '2px',
            right: '13px',
            backgroundColor: '#E82A00',
            color: 'white',
            fontSize: '9px',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '4px',
            fontWeight: 'bold',
            zIndex: '10',
        })
        iconeCarrinho.style.position = 'relative'
        iconeCarrinho.appendChild(contador)
    }

    contador.textContent = totalItens
}

// Verifica o estado ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    verificarEExibirLogout()
    await atualizarContador() // Adiciona await
})

// Opcional: Verifica periodicamente se o token ainda é válido
setInterval(async () => {
    verificarEExibirLogout()
    await atualizarContador() // Adiciona await
}, 5000)

window.atualizarContador = atualizarContador