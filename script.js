const itens = [];

function adicionarItem() {
    const linhasTemporarias = document.querySelectorAll('#inputsContainer .input-group');
    const itensTemporarios = [];

    // Captura os valores de todas as linhas temporárias
    linhasTemporarias.forEach(linha => {
        const inputs = linha.querySelectorAll('input');
        const item = inputs[0]?.value.trim();
        const quantidade = parseInt(inputs[1]?.value, 10) || 1;
        const valorUnitario = parseFloat(inputs[2]?.value);

        if (parseInt(inputs[1]?.value, 10) < 0) {
            alert("A quantidade não pode ser negativa.");
            return;
        }

        if (item && !isNaN(quantidade) && !isNaN(valorUnitario)) {
            itensTemporarios.push({ item, quantidade, valorUnitario });
        }
    });

    const novosNomes = document.getElementById('pessoas').value
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()); // Ajusta para primeira letra maiúscula

    // Adiciona novos checkboxes se ainda não existirem
    const listaIntegrantes = document.getElementById('listaIntegrantes');
    let integrantesAdicionados = false;

    novosNomes.forEach(nome => {
        if (nome && !Array.from(listaIntegrantes.children).some(label => label.textContent.trim() === nome)) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `cb_${nome}`;
            checkbox.value = nome;
            checkbox.className = 'pessoaCheckbox';

            const slider = document.createElement('span');
            slider.className = 'slider';

            const label = document.createElement('label');
            label.className = 'switch';
            label.appendChild(checkbox);
            label.appendChild(slider);
            label.appendChild(document.createTextNode(` ${nome}`));

            listaIntegrantes.appendChild(label);
            integrantesAdicionados = true;
        }
    });

    const labelIntegrantes = document.querySelector('label[for="listaIntegrantes"]');
    if (listaIntegrantes.children.length > 0 || integrantesAdicionados) {
        labelIntegrantes.style.display = 'block';
        listaIntegrantes.style.display = 'flex';
    } else {
        labelIntegrantes.style.display = 'none';
        listaIntegrantes.style.display = 'none';
    }

    const selecionadosCheckbox = Array.from(document.querySelectorAll('.pessoaCheckbox:checked')).map(cb => cb.value);
    const todasAsPessoas = Array.from(new Set([...novosNomes, ...selecionadosCheckbox]));

    if (itensTemporarios.length === 0 || todasAsPessoas.length === 0) {
        alert("Preencha todos os campos corretamente e informe pelo menos uma pessoa.");
        return;
    }

    // Adiciona os itens temporários ao array de itens
    itensTemporarios.forEach(({ item, quantidade, valorUnitario }) => {
        const valorTotal = valorUnitario * quantidade;
        const itemComQuantidade = `${quantidade}x ${item} (R$${valorUnitario.toFixed(2)})`;
        itens.push({ item: itemComQuantidade, valor: valorTotal, pessoas: todasAsPessoas });
    });

    const tabela = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpa a tabela

    itens.forEach((item, i) => {
        const novaLinha = tabela.insertRow();
        novaLinha.insertCell(0).textContent = item.valor.toFixed(2);
        novaLinha.insertCell(1).textContent = item.item;
        novaLinha.insertCell(2).textContent = item.pessoas.join(', ');

        const colunaExcluir = novaLinha.insertCell(3);
        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.style.background = '#FF5722';
        botaoExcluir.style.color = 'white';
        botaoExcluir.style.border = 'none';
        botaoExcluir.style.padding = '5px 10px';
        botaoExcluir.style.borderRadius = '4px';
        botaoExcluir.style.cursor = 'pointer';
        botaoExcluir.onclick = () => {
            if (confirm("Tem certeza que deseja excluir este item?")) {
                excluirItem(i);
            }
        };
        colunaExcluir.appendChild(botaoExcluir);
    });

    document.getElementById('tabelaItens').style.display = 'table';
    finalizar();

    // Limpa os campos de entrada
    document.getElementById('item').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('pessoas').value = '';
    document.querySelectorAll('.pessoaCheckbox').forEach(cb => cb.checked = false);

    // Remove as linhas temporárias geradas
    linhasTemporarias.forEach((linha, index) => {
        if (index > 0) linha.remove(); // Preserva a primeira linha
    });
}

function excluirItem(index) {
    // Remove o item da lista
    itens.splice(index, 1);

    // Recalcula os índices e atualiza a tabela
    const tabela = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; // Limpa a tabela

    itens.forEach((item, i) => {
        const novaLinha = tabela.insertRow();
        novaLinha.insertCell(0).textContent = item.valor.toFixed(2);
        novaLinha.insertCell(1).textContent = item.item;
        novaLinha.insertCell(2).textContent = item.pessoas.join(', ');

        const colunaExcluir = novaLinha.insertCell(3);
        const botaoExcluir = document.createElement('button');
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.style.background = '#FF5722'; // Cor do botão
        botaoExcluir.style.color = 'white';
        botaoExcluir.style.border = 'none';
        botaoExcluir.style.padding = '5px 10px';
        botaoExcluir.style.borderRadius = '4px';
        botaoExcluir.style.cursor = 'pointer';
        botaoExcluir.onclick = () => {
            if (confirm("Tem certeza que deseja excluir este item?")) {
                excluirItem(i);
            }
        };
        colunaExcluir.appendChild(botaoExcluir);
    });

    // Recalcula os resultados
    finalizar();

    // Oculta a tabela se não houver mais itens
    if (itens.length === 0) {
        document.getElementById('tabelaItens').style.display = 'none';
        document.getElementById('resultado').style.display = 'none';
    }
}

function finalizar() {
    const totais = {};
    let valorTotal = 0;

    // Calcula o total por pessoa e o valor total dos gastos
    itens.forEach(({ valor, pessoas }) => {
        const parte = valor / pessoas.length;
        valorTotal += valor;
        pessoas.forEach(p => {
            if (!totais[p]) totais[p] = 0;
            totais[p] += parte;
        });
    });

    const valorTotalComAcrescimo = valorTotal * 1.1; // Valor total + 10%

    // Atualiza os valores totais no cabeçalho
    document.getElementById('valorTotalHeader').textContent = `R$ ${valorTotal.toFixed(2)}`;
    document.getElementById('valorTotalHeader').style.color = 'black'; // Define a cor do valor total

    document.getElementById('valorTotalComAcrescimoHeader').textContent = `R$ ${valorTotalComAcrescimo.toFixed(2)}`;
    document.getElementById('valorTotalComAcrescimoHeader').style.color = 'black'; // Define a cor do valor total

    const tabelaResultado = document.getElementById('resultadoTabela');
    tabelaResultado.innerHTML = ''; // Limpa tabela anterior

    for (const pessoa in totais) {
        const valorPorPessoa = totais[pessoa];
        const valorPorPessoaComAcrescimo = valorPorPessoa * 1.1; // Valor por pessoa + 10%

        const novaLinha = tabelaResultado.insertRow();
        novaLinha.insertCell(0).textContent = pessoa;
        novaLinha.insertCell(1).textContent = valorPorPessoa.toFixed(2);
        novaLinha.insertCell(2).textContent = valorPorPessoaComAcrescimo.toFixed(2);
    }

    document.getElementById('resultado').style.display = 'block';
}

function adicionarLinha() {
    const container = document.getElementById('inputsContainer');
    const novaLinha = document.createElement('div');
    novaLinha.className = 'input-group'; // Reutiliza a classe definida no CSS
    novaLinha.style.display = 'flex';
    novaLinha.style.gap = '5%';
    novaLinha.style.alignItems = 'center';
    novaLinha.style.marginTop = '10px'; // Mantém o espaçamento entre linhas

    novaLinha.innerHTML = `
        <div style="flex: 0 0 40%; margin-right: 10px;">
            <input type="text" placeholder="Ex: Pizza">
        </div>
        <div style="flex: 0 0 10%; margin-right: 10px;">
            <input type="number" placeholder="Ex: 1">
        </div>
        <div style="flex: 0 0 15%; margin-right: 10px;">
            <input type="number" placeholder="Ex: 50.00">
        </div>
        <div style="flex: 0 0 5%; display: flex; align-items: flex-end; justify-content: center;">
            <button class="botao-icone botao-remover remover" onclick="removerLinha(this)">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `;

    container.appendChild(novaLinha);
}

function removerLinha(botao) {
    const linha = botao.parentElement.parentElement; // Seleciona o div pai da linha
    linha.remove();
}

function verificarDados() {
    const tabelaItens = document.getElementById('tabelaItens');
    const mensagemInicial = document.getElementById('mensagemInicial');

    if (itens.length === 0) {
        tabelaItens.style.display = 'none';
        mensagemInicial.style.display = 'block';
    } else {
        tabelaItens.style.display = 'table';
        mensagemInicial.style.display = 'none';
    }
}

// Chame a função ao carregar a página
document.addEventListener('DOMContentLoaded', verificarDados);