let itens = [];
let temaAtual = 'azul';
let editandoId = null;

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ordenarPorNome() {
    itens.sort((a, b) => a.nome.localeCompare(b.nome));
    atualizarLista();
}

function ordenarPorData() {
    itens.sort((a, b) => b.id - a.id);
    atualizarLista();
}

function calcularTotais() {
    const totalItens = itens.reduce((acc, item) => item.incluido ? acc + item.quantidade : acc, 0);
    const totalCompra = itens.reduce((acc, item) => item.incluido ? acc + (item.preco * item.quantidade) : acc, 0);
    document.getElementById('totalItens').textContent = totalItens;
    document.getElementById('totalCompra').textContent = formatarMoeda(totalCompra);
}

function atualizarURL() {
    const estado = JSON.stringify({ itens, temaAtual });
    window.history.replaceState(null, null, `#${btoa(estado)}`);
    localStorage.setItem('listaCompras', estado);
}

function carregarEstado() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            const estado = JSON.parse(atob(hash));
            itens = estado.itens;
            temaAtual = estado.temaAtual;
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    } else {
        const estadoLocal = localStorage.getItem('listaCompras');
        if (estadoLocal) {
            const estado = JSON.parse(estadoLocal);
            itens = estado.itens;
            temaAtual = estado.temaAtual;
        }
    }
    atualizarLista();
}

function alternarTemas() {
    const temas = ['rosa', 'azul', 'verde', 'amarelo', 'laranja', 'violeta'];
    temaAtual = temas[(temas.indexOf(temaAtual) + 1) % temas.length];
    document.body.setAttribute('data-tema', temaAtual);
    atualizarURL();
}

function manipularItem(event) {
    event.preventDefault();
    
    const dados = {
        id: editandoId || Date.now(),
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value),
        incluido: true
    };

    if (editandoId) {
        const index = itens.findIndex(i => i.id === editandoId);
        itens[index] = { ...itens[index], ...dados };
        editandoId = null;
    } else {
        itens.push(dados);
    }

    event.target.reset();
    document.getElementById('botaoAcao').innerHTML = '<i class="fas fa-plus"></i> Adicionar';
    document.getElementById('botaoCancelar').style.display = 'none';
    atualizarLista();
    calcularTotais();
    atualizarURL();
}

function editarItem(id) {
    const item = itens.find(i => i.id === id);
    if (!item) return;

    editandoId = id;
    document.getElementById('nome').value = item.nome;
    document.getElementById('preco').value = item.preco.toFixed(2);
    document.getElementById('quantidade').value = item.quantidade;
    
    document.getElementById('botaoAcao').innerHTML = '<i class="fas fa-save"></i> Salvar';
    document.getElementById('botaoCancelar').style.display = 'inline-block';
}

function cancelarEdicao() {
    editandoId = null;
    document.querySelector('form').reset();
    document.getElementById('botaoAcao').innerHTML = '<i class="fas fa-plus"></i> Adicionar';
    document.getElementById('botaoCancelar').style.display = 'none';
}

function atualizarLista() {
    const lista = document.getElementById('listaItens');
    lista.innerHTML = '';

    itens.forEach(item => {
        const elemento = document.createElement('div');
        const valorTotal = item.preco * item.quantidade;
        elemento.className = `item ${item.incluido ? '' : 'excluido'}`;
        elemento.innerHTML = `
            <div class="info-item">
                <strong>${item.nome}</strong>
                <div>Preço: ${formatarMoeda(item.preco)} | Quantidade: ${item.quantidade} | Total: ${formatarMoeda(valorTotal)}</div>
            </div>
            <div class="acoes-item">
                <i class="icone fas fa-check toggle-inclusao ${item.incluido ? 'ativo' : ''}" onclick="toggleInclusao(${item.id})"></i>
                <i class="icone fas fa-edit" onclick="editarItem(${item.id})"></i>
                <i class="icone fas fa-trash" onclick="excluirItem(${item.id})"></i>
            </div>
        `;
        lista.appendChild(elemento);
    });

    calcularTotais();
}

function toggleInclusao(id) {
    const item = itens.find(i => i.id === id);
    item.incluido = !item.incluido;
    atualizarLista();
    atualizarURL();
}

function excluirItem(id) {
    itens = itens.filter(i => i.id !== id);
    atualizarLista();
    atualizarURL();
}

function compartilhar() {
    navigator.clipboard.writeText(window.location.href);
    mostrarNotificacao('Link copiado para a área de transferência!');
}

function mostrarNotificacao(mensagem) {
    const notificacao = document.getElementById('notificacao');
    const notificacaoTexto = document.getElementById('notificacaoTexto');
    notificacaoTexto.innerText = mensagem;
    notificacao.classList.add('mostrar');
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
    }, 3000);
}

function fecharNotificacao() {
    const notificacao = document.getElementById('notificacao');
    notificacao.classList.remove('mostrar');
}

window.onload = () => {
    carregarEstado();
    document.body.setAttribute('data-tema', temaAtual);
};
