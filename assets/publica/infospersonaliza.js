const limites = {
    recheio: 2,
    cobertura: 5,
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

        const formData = new FormData(form);

    const pedido = {
                tamanho: formData.get('tamanho'),
                massa: formData.get('massa'),
                queijo: formData.get('queijo'),
                recheio: formData.getAll('recheio'),
                cobertura: formData.getAll('cobertura'),
                timestamp: new Date().toISOString()
            };
        if (!pedido.tamanho || !pedido.massa || !pedido.queijo|| !pedido.recheio || !pedido.cobertura) {
                mostrarAlerta('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
        try {
                const response = await fetch('http://localhost:3000/carrinho', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
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
                } else{
                    mostrarAlerta('Erro ao adicionar ao carrinho: ' + result.error, 'error');
                }
                }catch (error) {
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
 // Inicializar controle de limite ao carregar a página
        controlarLimiteCheckbox();
