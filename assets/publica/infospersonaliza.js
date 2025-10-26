const limites = {
    recheio: 2,
    cobertura: 5,
}

// Verifica se usuário está logado
function verificarLogin() {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Você precisa fazer login para personalizar sua pizza!')
        window.location.href = 'login.html'
        return false
    }
    return true
}

function controlarLimiteCheckbox(){
    Object.keys(limites).forEach(grupo =>{
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-group="${grupo}"]`);
        const limite = limites[grupo];

        checkboxes.forEach(checkbox =>{
            checkbox.addEventListener('change', function() {
                const selecionados = Array.from(checkboxes).filter(cb => cb.checked);

                if(selecionados.length >= limite){
                    checkboxes.forEach(cb => {
                        if(!cb.checked){
                            cb.disabled = true;
                        }
                    });
                if(selecionados.length === limite){
                       mostrarAlerta(`Limite de ${limite} ${limite === 1 ? 'seleção atingida' : 'seleções atingidas'} para ${grupo}`, 'warning', 2000);
                }
                } else{
                      // Reabilitar todos
                            checkboxes.forEach(cb => {
                                cb.disabled = false;
                            });
                }
                atualizarResumo();
            });
        });
    });
}

// Atualizar resumo em tempo real
const form = document.getElementById('pizzaForm');
const resumoContent = document.getElementById('resumoContent');

function atualizarResumo() {
const formData = new FormData(form);

const pedido = {
                tamanho: formData.get('tamanho'),
                massa: formData.get('massa'),
                queijo: formData.get('queijo'),
                recheio: formData.getAll('recheio'),
                cobertura: formData.getAll('cobertura')
            }
      let html = '';
            if (pedido.tamanho) 
                html += `<div class="resumo-item"><strong>Tamanho:</strong> ${pedido.tamanho}</div>`;
            if (pedido.massa) 
                html += `<div class="resumo-item"><strong>Tipo de Massa:</strong> ${pedido.massa}</div>`;
            if (pedido.queijo) 
                html += `<div class="resumo-item"><strong>Queijo:</strong> ${pedido.queijo}</div>`;
            if (pedido.recheio.length > 0) 
                html += `<div class="resumo-item"><strong>Recheio:</strong> ${pedido.recheio.join(', ')}</div>`;
            if (pedido.cobertura.length > 0) 
                html += `<div class="resumo-item"><strong>Coberturas:</strong> ${pedido.cobertura.join(', ')}</div>`;

            resumoContent.innerHTML = html || '<p style="opacity: 0.5; padding: 2vh 0 2vh;">*Selecione as opções acima para ver o resumo</p>';
}

// Adicionar listener para radios também atualizarem o resumo
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', atualizarResumo);
        });

// Enviar pedido
        form.addEventListener('submit', async (e) => {
            e.preventDefault();


   // Verifica login antes de enviar
    if (!verificarLogin()) {
        return;
    }

    const formData = new FormData(form);

    const observacoes = document.getElementById('obspersonalizacao').value;


    const pedido = {
                nome: 'Pizza Personalizada',
                preco: 60.00, // Preço base da pizza personalizada
                quantidade: 1,
                tipo: 'pizza_personalizada',
                personalizacao: {
                    tamanho: formData.get('tamanho'),
                    massa: formData.get('massa'),
                    queijo: formData.get('queijo'),
                    recheio: formData.getAll('recheio'),
                    cobertura: formData.getAll('cobertura'),
                    observacoes: observacoes
                },
                timestamp: new Date().toISOString()
            };
        if (!pedido.personalizacao.tamanho || !pedido.personalizacao.massa || 
                !pedido.personalizacao.queijo || pedido.personalizacao.recheio.length === 0) {
                mostrarAlerta('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
        
            // Pega o token do localStorage
    const token = localStorage.getItem('token');

        try {
                const response = await fetch('http://localhost:3000/carrinho', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token
                },
                    body: JSON.stringify(pedido)
                });
        
         const result = await response.json();

            if (response.ok) {
                    mostrarAlerta('Pizza adicionada ao carrinho com sucesso!', 'success');
                    form.reset();
                    resumoContent.innerHTML = '<p style="opacity: 0.5; padding: 2vh 0 2vh;">*Selecione as opções acima para ver o resumo</p>'

                    // Reabilitar todos os checkboxes
                    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        cb.disabled = false;
                    });
                    // Limpa textarea
                 document.getElementById('obspersonalizacao').value = '';
                }else {
            if (response.status === 401) {
                // Token inválido ou expirado
                alert('Sua sessão expirou. Faça login novamente.');
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
            } else {
                mostrarAlerta('Erro ao adicionar ao carrinho: ' + result.erro, 'error');
            }
        }
    } catch (error) {
        mostrarAlerta('Erro de conexão com o servidor', 'error');
        console.error('Erro:', error);
    }
});

 function mostrarAlerta(mensagem, tipo, duracao = 5000) {
            const alertContainer = document.getElementById('alertContainer');
            alertContainer.innerHTML = `<div class="alert alert-${tipo}">${mensagem}</div>`;
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, duracao);
        }
    function criarAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.style.position = 'fixed';
        container.style.top = '100px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    // Verifica login ao carregar a página
    document.addEventListener('DOMContentLoaded', () => {
        verificarLogin();
        controlarLimiteCheckbox();
    });
