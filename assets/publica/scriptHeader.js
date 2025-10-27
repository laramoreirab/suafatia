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

// Verifica o estado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    verificarEExibirLogout()
})

// Opcional: Verifica periodicamente se o token ainda é válido
setInterval(() => {
    verificarEExibirLogout()
}, 5000) // Verifica a cada 5 segundos