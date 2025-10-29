// Script para exibir resumo nas páginas de endereço e pagamento
function carregarResumo() {
    const resumoData = localStorage.getItem('resumoCarrinho');
    
    if (!resumoData) {
        alert('Carrinho vazio! Redirecionando...');
        window.location.href = 'carrinho.html';
        return;
    }
    
    const resumo = JSON.parse(resumoData);
    const containerResumo = document.querySelector('.cont-resumo');
    if (!containerResumo) return;

    // Lista itens do resumo
    const itensResumo = resumo.itens && resumo.itens.length > 0
        ? resumo.itens.map(item => {
            const isPizzaPersonalizada = item.pedido && item.pedido.tipo === 'pizza_personalizada';
            const itemNome = isPizzaPersonalizada ? item.pedido.nome : item.nome;
            const itemPreco = isPizzaPersonalizada ? item.pedido.preco : item.preco;
            const itemQuantidade = isPizzaPersonalizada ? item.pedido.quantidade : item.quantidade;

            return `
                <div class="context-resumo">
                    <p class="nomeprod">${itemNome} (x${itemQuantidade})</p>
                    <p class="precoprodresumo">R$ ${(itemPreco * itemQuantidade).toFixed(2).replace('.', ',')}</p>
                </div>
            `;
        }).join('')
        : '<p class="nomeprod" style="text-align: center;">Nenhum item</p>';

    // Define comportamento por página
    let proximaPagina = 'pagamento.html';
    let textoBotao = 'Continuar';
    let botaoFinal = '';

    if (window.location.pathname.includes('pagamento')) {
        // Se estiver na página de pagamento, o botão é "Finalizar"
        proximaPagina = null;
        textoBotao = 'Finalizar';
        botaoFinal = `<div class="alignbotaofinalizar"><button id="finalizarCompra" class="finalizar">Finalizar</button><div>`;
    } else {
        botaoFinal = `<a href="${proximaPagina}" class="continuarcompra"><button class="continuar">${textoBotao}</button></a>`;
    }

    // Monta o HTML completo do resumo
    const resumoHTML = `
        <hr class="prelineresumo">
        <h4><b>Resumo</b></h4>
        <hr class="line1resumo">
        ${itensResumo}
        <div class="context-resumo">
            <p class="textfrete">Frete de entrega</p>
            <p class="precofrete">R$ ${resumo.frete.toFixed(2).replace('.', ',')}</p>
        </div>
        <div class="context-resumo">
            <p class="subtotal">Subtotal</p>
            <p class="precosubtotal">R$ ${resumo.subtotal.toFixed(2).replace('.', ',')}</p>
        </div>
        <hr class="line2resumo">
        <div class="context-resumo">
            <p class="total">Total</p>
            <p class="precototal"><b>R$ ${resumo.total.toFixed(2).replace('.', ',')}</b></p>
        </div>
        ${botaoFinal}
    `;

    containerResumo.innerHTML = resumoHTML;
}

// Carrega o resumo ao abrir a página
document.addEventListener('DOMContentLoaded', carregarResumo);
