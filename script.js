document.addEventListener('DOMContentLoaded', function () {
    // Manipulador de erros global
    window.onerror = function(message, source, lineno, colno, error) {
        console.error(`Erro: ${message} em ${source}:${lineno}:${colno}`);
        const globalError = document.getElementById('global-error');
        if (globalError) {
            globalError.textContent = 'Erro no sistema. Verifique o console para detalhes.';
            globalError.style.display = 'block';
        }
        return true;
    };

    // Listener delegado para botões "Reservar"
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Reservar') {
            const card = event.target.closest('.card');
            if (card) {
                const title = card.querySelector('h3').textContent;
                const value = card.querySelector('p').textContent;
                openModal('car', title, value);
            }
        }
    });

    // Inicializar o mapa com Leaflet.js
    const mapElement = document.getElementById('map');
    if (mapElement) {
        const map = L.map('map').setView([-30.0346, -51.2177], 7); // Centro em Porto Alegre
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Lista de destinos com preços
        var destinations = [
            { name: 'Gramado', coords: [-29.37404, -50.87746], desc: 'Cidade das flores e neve'},
            { name: 'Bento Gonçalves', coords: [-29.16457, -51.51634], desc: 'Vinhos e paisagens incríveis'},
            { name: 'Torres', coords: [-29.33833, -49.72877], desc: 'Praias e ecoturismo'},
            { name: 'Vacaria', coords: [-28.49894, -50.93269], desc: 'Terra de maior festa tradicionalista da américa do sul'},
            { name: 'Canela', coords: [-29.36298, -50.80881], desc: 'Canela faz parte de um dos destinos turísticos mais charmosos do Brasil'},
            { name: 'Caxias Do Sul', coords: [-29.17208, -51.18484], desc: 'Combina tradição e modernidade'},
            { name: 'Cruz Alta', coords: [-28.64399, -53.61857], desc: 'Charme interiorano e tranquilidade'},
            { name: 'Erechim', coords: [-27.63434, -52.27496], desc: 'Um dos municípios mais seguros do estado'},
            { name: 'Alegrete', coords: [-29.78341, -55.79404], desc: 'História, cultura e gastronomia'},
            { name: 'Barra Do Ribeiro', coords: [-30.30064, -51.3036], desc: 'Praias de água doce e esportes náuticos'},
            { name: 'Cachoeirinha', coords: [-29.94498, -51.09494], desc: 'Divisa com Porto Alegre'},
            { name: 'Santo Ângelo', coords: [-28.30040, -54.27036], desc: 'História riquíssima e belezas naturais'},
            { name: 'Passo Fundo', coords: [-28.26286, -52.40548], desc: 'Capital Nacional da Literatura'},
            { name: 'Uruguaiana', coords: [-29.75841, -57.08288], desc: 'Destino turístico popular'},
            { name: 'Xangri-lá', coords: [-29.80249, -50.04089], desc: 'Belezas naturais e praias'},
            { name: 'Pelotas', coords: [-31.76770, -52.32330], desc: 'População diversificada e eventos culturais'},
            { name: 'Bagé', coords: [-31.332217, -54.09710], desc: 'Vocação para agronegócios'},
            { name: 'Porto Alegre', coords: [-30.03627, -51.18745], desc: 'Capital do Rio Grande do Sul'},
            { name: 'Canoas', coords: [-29.90664, -51.18811], desc: 'Cidade estratégica na região metropolitana'},
            { name: 'Santa Maria', coords: [-29.68649, -53.81710], desc: 'Cidade universitária e polo de serviços' },
            { name: 'Santa Cruz Do Sul', coords: [-29.70926, -52.43385], desc: 'Economia baseada na produção de tabaco'},
            { name: 'Tramandaí', coords: [-29.98351, -50.13344], desc: 'Cidade praiana do litoral norte'}
        ];

        // Adicionar marcadores ao mapa
        destinations.forEach(dest => {
            if (dest.name !== 'Porto Alegre') {
                L.marker(dest.coords)
                    .addTo(map)
                    .bindPopup(`<b>${dest.name}</b><br>${dest.desc}<br>`)
                    .on('click', () => {
                        openModal('flight', `Voo Porto Alegre - ${dest.name}`);
                    });
            } else {
                L.marker(dest.coords)
                    .addTo(map)
                    .bindPopup(`<b>${dest.name}</b><br>${dest.desc}`);
            }
        });
    }

    // Função unificada para abrir o modal de reserva
    window.openModal = function(type, title, value) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const results = document.getElementById('modal-results');
        const form = document.getElementById('modal-form');
        const pix = document.getElementById('pix-payment');
        const globalError = document.getElementById('global-error');

        if (!modal || !modalTitle || !modalDescription || !results || !form || !pix) {
            console.error('Elementos do modal não encontrados:', { modal, modalTitle, modalDescription, results, form, pix });
            if (globalError) {
                globalError.textContent = 'Erro: Não foi possível abrir o modal de reserva.';
                globalError.style.display = 'block';
            }
            return;
        }

        modal.classList.add('show');
        document.body.classList.add('menu-open');
        modalTitle.textContent = title || 'Reserva';
        modalDescription.textContent = value || '';
        results.innerHTML = '';
        form.innerHTML = '';
        pix.style.display = 'none';

        // Parse valor base
        let valorBase = 0;
        if (value) {
            let v = value.replace(/[^\d,]/g, '').replace(',', '.');
            valorBase = parseFloat(v) || 0;
        }

        let compra = {
            tipo: type,
            titulo: title,
            valorBase: valorBase,
            adultos: 1,
            criancas: 0,
            nomes: [],
            categoria: 'economica',
            pagamento: '',
            nome: '',
            email: '',
            total: 0,
            dias: 1,
            checkIn: '',
            checkOut: '',
            data: new Date().toLocaleString()
        };

        let etapa = 1;
        const today = new Date().toISOString().split('T')[0];

        // Etapa 1: Seleção de pessoas OU dias OU datas de check-in/check-out
        function renderEtapa1() {
            let formHtml = '';
            if (type === 'car') {
                formHtml = `
                    <label for="dias">Quantidade de dias:</label>
                    <input type="number" id="dias" min="1" value="1" required>
                    <button type="button" id="next-etapa1">Próximo</button>
                `;
            } else if (type === 'hotel') {
                formHtml = `
                    <label for="check-in">Data de Check-in:</label>
                    <input type="date" id="check-in" min="${today}" required>
                    <label for="check-out">Data de Check-out:</label>
                    <input type="date" id="check-out" min="${today}" required>
                    <label for="adultos">Adultos:</label>
                    <input type="number" id="adultos" min="1" value="1" required>
                    <label for="criancas">Crianças:</label>
                    <input type="number" id="criancas" min="0" value="0" required>
                    <button type="button" id="next-etapa1">Próximo</button>
                `;
            } else if (type === 'restaurant') {
                formHtml = `
                    <label for="data-reserva">Data da Reserva:</label>
                    <input type="date" id="data-reserva" min="${today}" required>
                    <label for="adultos">Adultos:</label>
                    <input type="number" id="adultos" min="1" value="1" required>
                    <label for="criancas">Crianças:</label>
                    <input type="number" id="criancas" min="0" value="0" required>
                    <button type="button" id="next-etapa1">Próximo</button>
                `;
            } else {
                formHtml = `
                    <label for="adultos">Adultos:</label>
                    <input type="number" id="adultos" min="1" value="1" required>
                    <label for="criancas">Crianças:</label>
                    <input type="number" id="criancas" min="0" value="0" required>
                    <button type="button" id="next-etapa1">Próximo</button>
                `;
            }
            form.innerHTML = formHtml;
            const nextBtn = document.getElementById('next-etapa1');
            if (nextBtn) {
                nextBtn.onclick = function() {
                    if (type === 'car') {
                        compra.dias = parseInt(document.getElementById('dias').value) || 1;
                        if (compra.dias <= 0) {
                            results.innerHTML = '<p style="color:red;">A quantidade de dias deve ser maior que 0.</p>';
                            return;
                        }
                        etapa = 3;
                        renderEtapa3();
                    } else if (type === 'hotel') {
                        const checkIn = document.getElementById('check-in').value;
                        const checkOut = document.getElementById('check-out').value;
                        if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) {
                            results.innerHTML = '<p style="color:red;">Datas inválidas. O check-out deve ser posterior ao check-in.</p>';
                            return;
                        }
                        compra.checkIn = checkIn;
                        compra.checkOut = checkOut;
                        compra.adultos = parseInt(document.getElementById('adultos').value) || 1;
                        compra.criancas = parseInt(document.getElementById('criancas').value) || 0;
                        etapa = 2;
                        renderEtapa2();
                    } else if (type === 'restaurant') {
                        const dataReserva = document.getElementById('data-reserva').value;
                        if (!dataReserva) {
                            results.innerHTML = '<p style="color:red;">Selecione uma data de reserva.</p>';
                            return;
                        }
                        compra.checkIn = dataReserva;
                        compra.adultos = parseInt(document.getElementById('adultos').value) || 1;
                        compra.criancas = parseInt(document.getElementById('criancas').value) || 0;
                        etapa = 3;
                        renderEtapa3();
                    } else {
                        compra.adultos = parseInt(document.getElementById('adultos').value) || 1;
                        compra.criancas = parseInt(document.getElementById('criancas').value) || 0;
                        etapa = 2;
                        renderEtapa2();
                    }
                };
            }
        }

        // Etapa 2: Categoria (voo, ônibus, promoção)
        function renderEtapa2() {
            if (type === 'flight' || type === 'bus' || type === 'promotion') {
                form.innerHTML = `
                    <label for="categoria">Categoria:</label>
                    <select id="categoria">
                        <option value="economica">Econômica</option>
                        <option value="executiva">Executiva (+30%)</option>
                    </select>
                    <button type="button" id="next-etapa2">Próximo</button>
                `;
                const nextBtn = document.getElementById('next-etapa2');
                if (nextBtn) {
                    nextBtn.onclick = function() {
                        compra.categoria = document.getElementById('categoria').value;
                        etapa = 3;
                        renderEtapa3();
                    };
                }
            } else {
                etapa = 3;
                renderEtapa3();
            }
        }

        // Etapa 3: Dados dos viajantes/pagamento
        function renderEtapa3() {
            let nomesFields = '';
            if (type !== 'car') {
                for (let i = 0; i < compra.adultos; i++) {
                    nomesFields += `<label for="nome_adulto_${i}">Nome do Adulto ${i + 1}:</label>
                    <input type="text" id="nome_adulto_${i}" required>`;
                }
                for (let i = 0; i < compra.criancas; i++) {
                    nomesFields += `<label for="nome_crianca_${i}">Nome da Criança ${i + 1}:</label>
                    <input type="text" id="nome_crianca_${i}" required>`;
                }
            }
            let carFields = '';
            if (type === 'car') {
                carFields = `
                    <label for="nome">Nome do responsável:</label>
                    <input type="text" id="nome" required>
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                `;
            }
            form.innerHTML = `
                ${type !== 'car' ? nomesFields : carFields}
                <label for="pagamento">Forma de Pagamento:</label>
                <select id="pagamento" required>
                    <option value="pix">Pix</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="boleto">Boleto Bancário</option>
                </select>
                <div id="cartao-fields" style="display:none;">
                    <label for="cartao-numero">Número do Cartão:</label>
                    <input type="text" id="cartao-numero" maxlength="19">
                    <label for="cartao-nome">Nome no Cartão:</label>
                    <input type="text" id="cartao-nome">
                    <label for="cartao-validade">Validade:</label>
                    <input type="text" id="cartao-validade" placeholder="MM/AA" maxlength="5">
                    <label for="cartao-cvv">CVV:</label>
                    <input type="text" id="cartao-cvv" maxlength="4">
                </div>
                <div id="boleto-fields" style="display:none;">
                    <p>O boleto será enviado para seu e-mail após finalizar a compra.</p>
                </div>
                <button type="button" id="next-etapa3">Próximo</button>
            `;
            const pix = document.getElementById('pix-payment');
            const pagamentoSelect = document.getElementById('pagamento');
            function updatePaymentFields() {
                if (!pagamentoSelect) return;
                if (pagamentoSelect.value === 'pix') {
                    pix.style.display = 'block';
                    const pixKey = 'southhorizontravel@gmail.com';
                    const pixKeyInput = document.getElementById('pix-key');
                    const pixValidation = document.getElementById('pix-validation');
                    if (pixKeyInput) pixKeyInput.value = pixKey;
                    if (pixValidation) {
                        pixValidation.textContent = validatePixKey(pixKey) ? 'Chave Pix válida!' : 'Erro: Chave Pix inválida.';
                        pixValidation.style.color = validatePixKey(pixKey) ? 'green' : 'red';
                    }
                    if (typeof QRCode !== 'undefined') {
                        generatePixQRCode(pixKey);
                    } else {
                        pixValidation.textContent = 'Erro: Não foi possível carregar o gerador de QR code.';
                        pixValidation.style.color = 'red';
                    }
                } else if (pagamentoSelect.value === 'cartao_credito' || pagamentoSelect.value === 'cartao_debito') {
                    pix.style.display = 'none';
                    document.getElementById('cartao-fields').style.display = 'block';
                    document.getElementById('boleto-fields').style.display = 'none';
                } else if (pagamentoSelect.value === 'boleto') {
                    pix.style.display = 'none';
                    document.getElementById('cartao-fields').style.display = 'none';
                    document.getElementById('boleto-fields').style.display = 'block';
                }
            }
            pagamentoSelect.addEventListener('change', updatePaymentFields);
            updatePaymentFields();

            document.getElementById('next-etapa3').onclick = function() {
                compra.nomes = [];
                if (type !== 'car') {
                    for (let i = 0; i < compra.adultos; i++) {
                        let nome = document.getElementById(`nome_adulto_${i}`).value;
                        if (!nome) {
                            results.innerHTML = '<p style="color:red;">Preencha todos os nomes dos adultos.</p>';
                            return;
                        }
                        compra.nomes.push({ tipo: 'adulto', nome });
                    }
                    for (let i = 0; i < compra.criancas; i++) {
                        let nome = document.getElementById(`nome_crianca_${i}`).value;
                        if (!nome) {
                            results.innerHTML = '<p style="color:red;">Preencha todos os nomes das crianças.</p>';
                            return;
                        }
                        compra.nomes.push({ tipo: 'crianca', nome });
                    }
                    compra.email = '';
                } else {
                    compra.nome = document.getElementById('nome').value;
                    compra.email = document.getElementById('email').value;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!compra.nome || !compra.email || !emailRegex.test(compra.email)) {
                        results.innerHTML = '<p style="color:red;">Preencha todos os campos obrigatórios com um e-mail válido.</p>';
                        return;
                    }
                }
                compra.pagamento = document.getElementById('pagamento').value;
                if (compra.pagamento === 'cartao_credito' || compra.pagamento === 'cartao_debito') {
                    let n = document.getElementById('cartao-numero').value;
                    let nm = document.getElementById('cartao-nome').value;
                    let v = document.getElementById('cartao-validade').value;
                    let cvv = document.getElementById('cartao-cvv').value;
                    if (!n || !nm || !v || !cvv) {
                        results.innerHTML = '<p style="color:red;">Preencha todos os dados do cartão.</p>';
                        return;
                    }
                    compra.cartao = { numero: n, nome: nm, validade: v, cvv: cvv };
                }
                etapa = 4;
                renderEtapa4();
            };
        }

        // Etapa 4: Resumo e finalização
        function renderEtapa4() {
            let valorTotal = 0;
            if (type === 'car') {
                valorTotal = compra.dias * compra.valorBase;
            } else if (type === 'hotel') {
                const checkInDate = new Date(compra.checkIn);
                const checkOutDate = new Date(compra.checkOut);
                const diffTime = Math.abs(checkOutDate - checkInDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                valorTotal = diffDays * compra.valorBase * compra.adultos + (compra.criancas * (compra.valorBase * 0.5));
            } else if (type === 'restaurant') {
                valorTotal = compra.adultos * compra.valorBase + (compra.criancas * (compra.valorBase * 0.5));
            } else if (type === 'promotion') {
                valorTotal = (compra.adultos * compra.valorBase) + (compra.criancas * (compra.valorBase * 0.5));
                if (compra.categoria === 'executiva') valorTotal *= 1.3;
            } else {
                valorTotal = (compra.adultos * compra.valorBase) + (compra.criancas * (compra.valorBase * 0.5));
                if (compra.categoria === 'executiva') valorTotal *= 1.3;
            }
            compra.total = Math.round(valorTotal * 100) / 100;
            let categoriaLabel = (type === 'flight' || type === 'bus' || type === 'promotion') ? (compra.categoria === 'executiva' ? 'Executiva' : 'Econômica') : '-';
            let pagamentoLabel = {
                pix: 'Pix',
                cartao_credito: 'Cartão de Crédito',
                cartao_debito: 'Cartão de Débito',
                boleto: 'Boleto Bancário'
            }[compra.pagamento] || compra.pagamento;
            let nomesList = '';
            if (type !== 'car') {
                nomesList = '<li><strong>Viajantes:</strong><ul style="padding-left:12px;">' +
                    compra.nomes.map(n => `<li>${n.tipo === 'adulto' ? 'Adulto' : 'Criança'}: ${n.nome}</li>`).join('') +
                    '</ul></li>';
            }
            let extraFields = '';
            if (type === 'car') {
                extraFields = `<li><strong>Dias:</strong> ${compra.dias}</li>`;
            } else if (type === 'hotel') {
                extraFields = `<li><strong>Check-in:</strong> ${compra.checkIn}</li><li><strong>Check-out:</strong> ${compra.checkOut}</li>`;
            } else if (type === 'restaurant') {
                extraFields = `<li><strong>Data da Reserva:</strong> ${compra.checkIn}</li>`;
            }
            form.innerHTML = `
                <h3>Resumo da Compra</h3>
                <ul style="list-style:none;padding:0;">
                    <li><strong>Serviço:</strong> ${compra.titulo}</li>
                    ${extraFields}
                    ${type !== 'car' ? `<li><strong>Adultos:</strong> ${compra.adultos}</li>
                    <li><strong>Crianças:</strong> ${compra.criancas}</li>` : ''}
                    ${nomesList}
                    <li><strong>Categoria:</strong> ${categoriaLabel}</li>
                    <li><strong>Pagamento:</strong> ${pagamentoLabel}</li>
                    <li><strong>Nome:</strong> ${type === 'car' ? compra.nome : compra.nomes[0]?.nome || ''}</li>
                    <li><strong>Email:</strong> ${compra.email || ''}</li>
                    <li><strong>Total:</strong> R$ ${compra.total.toFixed(2)}</li>
                </ul>
                <button type="button" id="finalizar-compra">Finalizar Compra</button>
                <button type="button" onclick="closeModal()">Fechar</button>
            `;
            document.getElementById('finalizar-compra').onclick = function() {
                try {
                    let compras = JSON.parse(localStorage.getItem('compras') || '[]');
                    compras.push(compra);
                    localStorage.setItem('compras', JSON.stringify(compras));
                    results.innerHTML = '<p style="color:green;">Compra finalizada com sucesso!</p>';
                    form.style.display = 'none';
                    pix.style.display = 'none';
                } catch (e) {
                    results.innerHTML = '<p style="color:red;">Erro ao salvar a compra. Verifique as configurações do navegador.</p>';
                    return;
                }
            };
        }

        // Inicia fluxo
        renderEtapa1();
    };

    window.closeModal = function () {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('show');
            document.getElementById('qrcode').innerHTML = '';
            document.body.classList.remove('menu-open');
        }
    };

    window.openWhatsAppModal = function () {
        window.open('https://wa.me/5551981299926?text=quero+saber+mais!', '_blank');
    };

    window.closeWhatsAppModal = function () {
        const whatsappModal = document.getElementById('whatsapp-modal');
        if (whatsappModal) {
            whatsappModal.classList.remove('show');
            const error = document.getElementById('whatsapp-error');
            if (error) error.style.display = 'none';
        }
    };

    const whatsappForm = document.getElementById('whatsapp-form');
    if (whatsappForm) {
        whatsappForm.onsubmit = function (e) {
            e.preventDefault();
            const name = document.getElementById('whatsapp-name').value;
            const phone = document.getElementById('whatsapp-phone').value;
            const message = document.getElementById('whatsapp-message').value;
            const phoneRegex = /^\+55\d{2}\d{8,9}$/;
            const error = document.getElementById('whatsapp-error');
            if (!phoneRegex.test(phone)) {
                if (error) {
                    error.textContent = 'Telefone inválido. Use o formato +55XXYYYYYYYY.';
                    error.style.display = 'block';
                }
                return;
            }
            const whatsappUrl = `https://wa.me/+5551981299926?text=${encodeURIComponent(`Olá, meu nome é ${name}. ${message}`)}`;
            window.open(whatsappUrl, '_blank');
            if (error) error.style.display = 'none';
            whatsappForm.reset();
            closeWhatsAppModal();
        };
    }

    const searchForm = document.getElementById('search-trip-form');
    if (searchForm) {
        searchForm.onsubmit = function (e) {
            e.preventDefault();
            const origem = document.getElementById('origem').value;
            const destino = document.getElementById('destino').value;
            const dataIda = document.getElementById('dataIda').value;
            const dataVolta = document.getElementById('dataVolta').value;

            if (!origem || !destino || !dataIda || !dataVolta) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            if (origem === destino) {
                alert('Origem e destino não podem ser iguais.');
                return;
            }
            if (new Date(dataIda) >= new Date(dataVolta) || new Date(dataIda) < new Date().toISOString().split('T')[0]) {
                alert('Datas inválidas. A data de ida deve ser posterior a hoje e a data de volta deve ser posterior à ida.');
                return;
            }

            const foundDestino = destinations.find(d => d.name.toLowerCase() === destino.toLowerCase());
            if (origem.toLowerCase() !== 'porto alegre' || !foundDestino) {
                alert('Origem deve ser Porto Alegre e destino deve ser válido.');
                return;
            }

            openModal('flight', `Voo Porto Alegre - ${foundDestino.name}`, `R$${foundDestino.price},00`);
        };
    }

    window.showLogin = function () {
        closeWhatsAppModal();
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalForm = document.getElementById('modal-form');
        const modalResults = document.getElementById('modal-results');
        const pixPaymentDiv = document.getElementById('pix-payment');

        if (!modal || !modalTitle || !modalDescription || !modalForm || !modalResults || !pixPaymentDiv) {
            console.error('Elementos do modal de login não encontrados');
            return;
        }

        modalTitle.textContent = 'Login';
        modalDescription.textContent = 'Entre com sua conta para continuar.';
        modalResults.innerHTML = '';
        pixPaymentDiv.style.display = 'none';
        modalForm.innerHTML = `
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Senha:</label>
            <input type="password" id="password" required>
            <button type="submit">Entrar</button>
        `;
        modal.classList.add('show');

        modalForm.onsubmit = function (e) {
            e.preventDefault();
            alert('Login simulado com sucesso! Email: ' + document.getElementById('email').value);
            closeModal();
        };
    };

    function validatePixKey(pixKey) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+55\d{2}\d{8,9}$/;
        const randomKeyRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
        return emailRegex.test(pixKey) || phoneRegex.test(pixKey) || randomKeyRegex.test(pixKey);
    }

    function generatePixQRCode(pixKey) {
        const qrcodeDiv = document.getElementById('qrcode');
        if (!qrcodeDiv) return;
        qrcodeDiv.innerHTML = '';
        const pixPayload = `00020101021126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865405100.005802BR5913SouthHorizon6009PortoAlegre62070503***6304F1A2`;
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrcodeDiv, {
                text: pixPayload,
                width: 150,
                height: 150
            });
        } else {
            document.getElementById('pix-validation').textContent = 'Erro: QRCode library not loaded.';
            document.getElementById('pix-validation').style.color = 'red';
        }
    }

    window.copyPixKey = function () {
        const pixKeyInput = document.getElementById('pix-key');
        if (pixKeyInput) {
            navigator.clipboard.writeText(pixKeyInput.value).then(() => {
                document.getElementById('pix-validation').textContent = 'Chave Pix copiada!';
                document.getElementById('pix-validation').style.color = 'green';
            }).catch(() => {
                document.getElementById('pix-validation').textContent = 'Erro ao copiar a chave Pix.';
                document.getElementById('pix-validation').style.color = 'red';
            });
        }
    };

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal && confirm('Deseja cancelar a reserva?')) {
                closeModal();
            }
        });
    }

    const whatsappModal = document.getElementById('whatsapp-modal');
    if (whatsappModal) {
        whatsappModal.addEventListener('click', function (e) {
            if (e.target === whatsappModal) {
                closeWhatsAppModal();
            }
        });
    }

    window.toggleMenu = function() {
        var menu = document.getElementById('hamburger-menu');
        if (menu) {
            menu.classList.toggle('show');
            document.body.classList.toggle('menu-open', menu.classList.contains('show'));
        }
    };

    var menuLinks = document.querySelectorAll('#hamburger-menu ul li a');
    menuLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            var menu = document.getElementById('hamburger-menu');
            if (menu) {
                menu.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            var menu = document.getElementById('hamburger-menu');
            if (menu) {
                menu.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        }
    });

    window.showPurchases = function() {
        var container = document.getElementById('purchases-container');
        if (!container) return;
        let compras = JSON.parse(localStorage.getItem('compras') || '[]');
        if (compras.length === 0) {
            container.innerHTML = '<p>Nenhuma compra realizada.</p>';
            return;
        }
        let html = '<div class="compras-list">';
        compras.forEach(c => {
            let categoriaLabel = (c.tipo === 'flight' || c.tipo === 'bus' || c.tipo === 'promotion') ? (c.categoria === 'executiva' ? 'Executiva' : 'Econômica') : '-';
            let pagamentoLabel = {
                pix: 'Pix',
                cartao_credito: 'Cartão de Crédito',
                cartao_debito: 'Cartão de Débito',
                boleto: 'Boleto Bancário'
            }[c.pagamento] || c.pagamento;
            let extraFields = '';
            if (c.tipo === 'car') {
                extraFields = `<li><strong>Dias:</strong> ${c.dias}</li>`;
            } else if (c.tipo === 'hotel') {
                extraFields = `<li><strong>Check-in:</strong> ${c.checkIn}</li><li><strong>Check-out:</strong> ${c.checkOut}</li>`;
            } else if (c.tipo === 'restaurant') {
                extraFields = `<li><strong>Data da Reserva:</strong> ${c.checkIn}</li>`;
            }
            html += `
            <div class="compra-card">
                <h3>${c.titulo}</h3>
                <ul style="list-style:none;padding:0;">
                    <li><strong>Tipo:</strong> ${c.tipo}</li>
                    ${extraFields}
                    <li><strong>Adultos:</strong> ${c.adultos}</li>
                    <li><strong>Crianças:</strong> ${c.criancas}</li>
                    <li><strong>Categoria:</strong> ${categoriaLabel}</li>
                    <li><strong>Pagamento:</strong> ${pagamentoLabel}</li>
                    <li><strong>Nome:</strong> ${c.nome || c.nomes[0]?.nome || ''}</li>
                    <li><strong>Email:</strong> ${c.email || ''}</li>
                    <li><strong>Total:</strong> R$ ${c.total ? c.total.toFixed(2) : '-'}</li>
                    <li><strong>Data:</strong> ${c.data}</li>
                </ul>
            </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    };
});