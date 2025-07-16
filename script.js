const itens = [];

function atualizarCache() {
    localStorage.setItem('itens', JSON.stringify(itens));
}

function cleanCache() {
    localStorage.removeItem('itens');
    itens.length = 0; // Limpa o array de itens
    document.getElementById('tabelaItens').style.display = 'none'; // Oculta a tabela
    document.getElementById('resultado').style.display = 'none'; // Oculta o resultado
    document.getElementById('listaIntegrantes').style.display = 'none'; // Limpa os campos de entrada
    document.getElementById('listaIntegrantes').innerHTML = ''; // Limpa a lista de integrante
    document.querySelector('label[for="listaIntegrantes"]').style.display = 'none'; // Oculta o label
}

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

        const colunaAcoes = novaLinha.insertCell(3);

        // Contêiner para os botões
        const containerBotoes = document.createElement('div');
        containerBotoes.style.display = 'flex';
        containerBotoes.style.gap = '10px'; // Espaçamento entre os botões

        // Botão de excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-icone botao-remover remover'; // Adiciona classes para estilo
        botaoExcluir.style.background = 'none'; // Remove o fundo
        botaoExcluir.style.border = 'none'; // Remove a borda
        botaoExcluir.style.cursor = 'pointer'; // Define o cursor como ponteiro
        botaoExcluir.style.width = '15px'; // Define a largura do botão
        botaoExcluir.onclick = () => {
            if (confirm("Tem certeza que deseja excluir este item?")) {
                excluirItem(i);
            }
        };

        const iconeExcluir = document.createElement('span');
        iconeExcluir.className = 'material-icons';
        iconeExcluir.textContent = 'delete'; // Ícone do Material Icons

        botaoExcluir.appendChild(iconeExcluir);
        containerBotoes.appendChild(botaoExcluir);

        // Botão de editar
        const botaoEditar = document.createElement('button');
        botaoEditar.className = 'botao-icone botao-editar editar'; // Adiciona classes para estilo
        botaoEditar.style.background = 'none'; // Remove o fundo
        botaoEditar.style.border = 'none'; // Remove a borda
        botaoEditar.style.cursor = 'pointer'; // Define o cursor como ponteiro
        botaoEditar.style.width = '15px'; // Define a largura do botão
        botaoEditar.onclick = () => {
            editarItem(i); // Função para editar o item
        };

        const iconeEditar = document.createElement('span');
        iconeEditar.className = 'material-icons';
        iconeEditar.textContent = 'edit'; // Ícone do Material Icons
        iconeEditar.style.color = 'white'; // Define a cor do ícone

        botaoEditar.appendChild(iconeEditar);
        containerBotoes.appendChild(botaoEditar);

        // Adiciona o contêiner à coluna
        colunaAcoes.appendChild(containerBotoes);
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

    atualizarCache()
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

        const colunaAcoes = novaLinha.insertCell(3);

        // Contêiner para os botões
        const containerBotoes = document.createElement('div');
        containerBotoes.style.display = 'flex';
        containerBotoes.style.gap = '10px'; // Espaçamento entre os botões

        // Botão de excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-icone botao-remover remover'; // Adiciona classes para estilo
        botaoExcluir.style.background = 'none'; // Remove o fundo
        botaoExcluir.style.border = 'none'; // Remove a borda
        botaoExcluir.style.cursor = 'pointer'; // Define o cursor como ponteiro
        botaoExcluir.style.width = '15px'; // Define a largura do botão
        botaoExcluir.onclick = () => {
            if (confirm("Tem certeza que deseja excluir este item?")) {
                excluirItem(i);
            }
        };

        const iconeExcluir = document.createElement('span');
        iconeExcluir.className = 'material-icons';
        iconeExcluir.textContent = 'delete'; // Ícone do Material Icons

        botaoExcluir.appendChild(iconeExcluir);
        containerBotoes.appendChild(botaoExcluir);

        // Botão de editar
        const botaoEditar = document.createElement('button');
        botaoEditar.className = 'botao-icone botao-editar editar'; // Adiciona classes para estilo
        botaoEditar.style.background = 'none'; // Remove o fundo
        botaoEditar.style.border = 'none'; // Remove a borda
        botaoEditar.style.cursor = 'pointer'; // Define o cursor como ponteiro
        botaoEditar.style.width = '15px'; // Define a largura do botão
        botaoEditar.onclick = () => {
            editarItem(i); // Função para editar o item
        };

        const iconeEditar = document.createElement('span');
        iconeEditar.className = 'material-icons';
        iconeEditar.textContent = 'edit'; // Ícone do Material Icons

        botaoEditar.appendChild(iconeEditar);
        containerBotoes.appendChild(botaoEditar);

        // Adiciona o contêiner à coluna
        colunaAcoes.appendChild(containerBotoes);
    });

    // Recalcula os resultados
    finalizar();

    // Oculta a tabela se não houver mais itens
    if (itens.length === 0) {
        document.getElementById('tabelaItens').style.display = 'none';
        document.getElementById('resultado').style.display = 'none';
    }

    atualizarCache()
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

    if (itens.length === 0) {
        tabelaItens.style.display = 'none';
    } else {
        tabelaItens.style.display = 'table';
    }
}

// Função para verificar cache e carregar itens
function carregarItensDoCache() {
    const itensCache = localStorage.getItem('itens');
    
    if (itensCache) {
        try {
            const itensArmazenados = JSON.parse(itensCache);
            itens.push(...itensArmazenados);

            // Cria os checkboxes para os integrantes no cache
            const listaIntegrantes = document.getElementById('listaIntegrantes');
            const nomesIntegrantes = new Set(itensArmazenados.flatMap(item => item.pessoas)); // Extrai os nomes únicos

            nomesIntegrantes.forEach(nome => {
                if (!Array.from(listaIntegrantes.children).some(label => label.textContent.trim() === nome)) {
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
                }
            });
            // Atualiza a visibilidade da lista de integrantes
            const labelIntegrantes = document.querySelector('label[for="listaIntegrantes"]');
            if (listaIntegrantes.children.length > 0) {
                labelIntegrantes.style.display = 'block';
                listaIntegrantes.style.display = 'flex';
            } else {
                labelIntegrantes.style.display = 'none';
                listaIntegrantes.style.display = 'none';
            }

            // Atualiza a tabela com os itens do cache
            const tabela = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
            tabela.innerHTML = ''; // Limpa a tabela

            itens.forEach((item, i) => {
                const novaLinha = tabela.insertRow();
                novaLinha.insertCell(0).textContent = item.valor.toFixed(2);
                novaLinha.insertCell(1).textContent = item.item;
                novaLinha.insertCell(2).textContent = item.pessoas.join(', ');

                const colunaAcoes = novaLinha.insertCell(3);

                // Contêiner para os botões
                const containerBotoes = document.createElement('div');
                containerBotoes.style.display = 'flex';
                containerBotoes.style.gap = '10px';

                // Botão de excluir
                const botaoExcluir = document.createElement('button');
                botaoExcluir.className = 'botao-icone botao-remover remover';
                botaoExcluir.style.background = 'none';
                botaoExcluir.style.border = 'none';
                botaoExcluir.style.cursor = 'pointer';
                botaoExcluir.style.width = '15px';
                botaoExcluir.onclick = () => {
                    if (confirm("Tem certeza que deseja excluir este item?")) {
                        excluirItem(i);
                    }
                };

                const iconeExcluir = document.createElement('span');
                iconeExcluir.className = 'material-icons';
                iconeExcluir.textContent = 'delete';

                botaoExcluir.appendChild(iconeExcluir);
                containerBotoes.appendChild(botaoExcluir);

                // Botão de editar
                const botaoEditar = document.createElement('button');
                botaoEditar.className = 'botao-icone botao-editar editar';
                botaoEditar.style.background = 'none';
                botaoEditar.style.border = 'none';
                botaoEditar.style.cursor = 'pointer';
                botaoEditar.style.width = '15px';
                botaoEditar.onclick = () => {
                    editarItem(i);
                };

                const iconeEditar = document.createElement('span');
                iconeEditar.className = 'material-icons';
                iconeEditar.textContent = 'edit';

                botaoEditar.appendChild(iconeEditar);
                containerBotoes.appendChild(botaoEditar);

                colunaAcoes.appendChild(containerBotoes);
            });

            document.getElementById('tabelaItens').style.display = 'table';

            verificarDados();

            if(itens.length > 0) {
            finalizar();
            }

        } catch (error) {
            console.error("Erro ao carregar os itens do cache:", error);
        }
    } else {
        verificarDados();
    }
}

// Chame a função ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarItensDoCache()
});