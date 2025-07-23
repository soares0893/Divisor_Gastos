const itens = [];

function atualizarCacheIntegrantes(integrantes) {
    localStorage.setItem('integrantes', JSON.stringify(integrantes));
}

// Atualiza o cache de itens (não atualiza o cache de integrantes)
function atualizarCache() {
    localStorage.setItem('itens', JSON.stringify(itens));
}

function cleanCache() {
    // Confirmação para limpar o cache de itens
    if (confirm("Tem certeza que deseja limpar o cache de itens?")) {
        localStorage.removeItem('itens');
        itens.length = 0; // Limpa o array de itens
        document.getElementById('tabelaItens').style.display = 'none'; // Oculta a tabela
        document.getElementById('resultado').style.display = 'none'; // Oculta o resultado
    }

    // Confirmação para limpar o cache de integrantes
    if (confirm("Deseja também limpar o cache de integrantes?")) {
        localStorage.removeItem('integrantes'); // Remove o cache de integrantes
        document.getElementById('listaIntegrantes').style.display = 'none'; // Oculta os campos de entrada
        document.getElementById('listaIntegrantes').innerHTML = ''; // Limpa a lista de integrantes
        document.querySelector('label[for="listaIntegrantes"]').style.display = 'none'; // Oculta o label
    }
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

    // Carrega os integrantes existentes do cache
    const integrantesCache = localStorage.getItem('integrantes');
    const integrantesExistentes = integrantesCache ? JSON.parse(integrantesCache) : [];

    // Combina os integrantes existentes com os novos
    const todosIntegrantes = Array.from(new Set([...integrantesExistentes, ...novosNomes]));

    // Atualiza os checkboxes na interface
    const listaIntegrantes = document.getElementById('listaIntegrantes');
    todosIntegrantes.forEach(nome => {
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

    const labelIntegrantes = document.querySelector('label[for="listaIntegrantes"]');
    if (listaIntegrantes.children.length > 0) {
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
        containerBotoes.className = 'botao-container'; // Aplica a classe padronizada

        // Botão de excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-icone botao-remover remover';
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
    finalizar();

    // Atualiza o cache de integrantes
    atualizarCacheIntegrantes(todosIntegrantes);

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

    atualizarCache();
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
        containerBotoes.className = 'botao-container'; // Aplica a classe padronizada

        // Botão de excluir
        const botaoExcluir = document.createElement('button');
        botaoExcluir.className = 'botao-icone botao-remover remover';
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

    // Recalcula os resultados
    finalizar();

    // Oculta a tabela e os resultados se não houver mais itens
    if (itens.length === 0) {
        document.getElementById('tabelaItens').style.display = 'none';
        document.getElementById('resultado').style.display = 'none';
    }

    // Atualiza o cache
    atualizarCache();
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
                novaLinha.style.height = '10px'; // Define a altura da linha

                novaLinha.insertCell(0).textContent = item.valor.toFixed(2);
                novaLinha.insertCell(1).textContent = item.item;
                novaLinha.insertCell(2).textContent = item.pessoas.join(', ');

                const colunaAcoes = novaLinha.insertCell(3);

                // Contêiner para os botões
                const containerBotoes = document.createElement('div');
                containerBotoes.className = 'botao-container'; // Aplica a classe padronizada

                // Botão de excluir
                const botaoExcluir = document.createElement('button');
                botaoExcluir.className = 'botao-icone botao-remover remover';
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

// Atualiza o cache de integrantes
function atualizarCacheIntegrantes(integrantes) {
    localStorage.setItem('integrantes', JSON.stringify(integrantes));
}

// Carrega os integrantes do cache
function carregarIntegrantesDoCache() {
    const integrantesCache = localStorage.getItem('integrantes');
    const listaIntegrantes = document.getElementById('listaIntegrantes');

    if (integrantesCache) {
        try {
            const integrantesArmazenados = JSON.parse(integrantesCache);

            // Cria os checkboxes para os integrantes no cache
            integrantesArmazenados.forEach(nome => {
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
        } catch (error) {
            console.error("Erro ao carregar os integrantes do cache:", error);
        }
    }
}

// Chame a função ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarItensDoCache();
    carregarIntegrantesDoCache();
});

function editarItem(index) {
    const itemParaEditar = itens[index];

    // Verifica se algum input já está preenchido
    const itemInput = document.getElementById('item').value.trim();
    const quantidadeInput = document.getElementById('quantidade').value.trim();
    const valorInput = document.getElementById('valor').value.trim();

    if (itemInput || quantidadeInput || valorInput) {
        alert("Não é possível editar enquanto há campos preenchidos. Limpe os campos antes de continuar.");
        return;
    }

    // Confirmação antes de editar
    if (confirm("Você realmente deseja editar este item?")) {
        // Preenche os inputs com os dados do item selecionado
        document.getElementById('item').value = itemParaEditar.item.split('x ')[1].split(' (')[0]; // Extrai o nome do item
        document.getElementById('quantidade').value = parseInt(itemParaEditar.item.split('x ')[0]); // Extrai a quantidade
        document.getElementById('valor').value = (itemParaEditar.valor / parseInt(itemParaEditar.item.split('x ')[0])).toFixed(2); // Calcula o valor unitário

        // Atualiza os checkboxes dos integrantes
        const checkboxes = document.querySelectorAll('.pessoaCheckbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = itemParaEditar.pessoas.includes(checkbox.value);
        });

        // Remove o item do array
        itens.splice(index, 1);

        // Atualiza a tabela
        const tabela = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
        tabela.innerHTML = ''; // Limpa a tabela

        // Recria a tabela com os itens restantes
        itens.forEach((item, i) => {
            const novaLinha = tabela.insertRow();
            novaLinha.insertCell(0).textContent = item.valor.toFixed(2);
            novaLinha.insertCell(1).textContent = item.item;
            novaLinha.insertCell(2).textContent = item.pessoas.join(', ');

            const colunaAcoes = novaLinha.insertCell(3);

            // Contêiner para os botões
            const containerBotoes = document.createElement('div');
            containerBotoes.className = 'botao-container'; // Aplica a classe padronizada
            containerBotoes.style.display = 'flex'; // Garante que os botões fiquem lado a lado
            containerBotoes.style.justifyContent = 'center'; // Centraliza os botões
            containerBotoes.style.gap = '10px'; // Adiciona espaçamento entre os botões

            // Botão de excluir
            const botaoExcluir = document.createElement('button');
            botaoExcluir.className = 'botao-icone botao-remover remover';
            botaoExcluir.style.display = 'flex'; // Garante que o botão respeite o estilo flex
            botaoExcluir.style.alignItems = 'center'; // Centraliza o conteúdo do botão
            botaoExcluir.onclick = () => {
                if (confirm("Tem certeza que deseja excluir este item?")) {
                    excluirItem(i);
                }
            };

            const iconeExcluir = document.createElement('span');
            iconeExcluir.className = 'material-icons';
            iconeExcluir.textContent = 'delete';

            botaoExcluir.appendChild(iconeExcluir);

            // Botão de editar
            const botaoEditar = document.createElement('button');
            botaoEditar.className = 'botao-icone botao-editar editar';
            botaoEditar.style.display = 'flex'; // Garante que o botão respeite o estilo flex
            botaoEditar.style.alignItems = 'center'; // Centraliza o conteúdo do botão
            botaoEditar.onclick = () => editarItem(i);

            const iconeEditar = document.createElement('span');
            iconeEditar.className = 'material-icons';
            iconeEditar.textContent = 'edit';

            botaoEditar.appendChild(iconeEditar);

            // Adiciona os botões ao contêiner na ordem correta
            containerBotoes.appendChild(botaoExcluir); // Excluir à esquerda
            containerBotoes.appendChild(botaoEditar); // Editar à direita

            colunaAcoes.appendChild(containerBotoes);
        });

        // Atualiza o cache
        atualizarCache();
        finalizar();
    }
}