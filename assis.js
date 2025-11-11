document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const conversationDisplay = document.getElementById('conversation-display');
    const choicesArea = document.getElementById('choices-area');
    const restartButton = document.getElementById('restart-button');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = document.getElementById('close-message-btn');
    const authModal = document.getElementById('auth-modal');
    const chatContainer = document.querySelector('.chat-container');

    // Verificar se os elementos DOM do chat existem
    if (!conversationDisplay || !choicesArea || !restartButton || !messageBox || !messageText || !closeMessageBtn) {
        console.error('Erro: Um ou mais elementos DOM do chat não foram encontrados.');
        return;
    }

    // --- Conversation Flow Data ---
    const conversationNodes = {
        'start': {
            message: 'Olá! Bem-vindo(a) à South Horizon Travel. Como posso ajudar a planejar sua aventura pelo Rio Grande do Sul?',
            choices: [
                { text: 'Conhecer pacotes de viagem', nextNodeId: 'travel_packages' },
                { text: 'Ajuda com uma reserva', nextNodeId: 'booking_support' },
                { text: 'Informações sobre destinos gaúchos', nextNodeId: 'destinations' },
                { text: 'Falar com um atendente', nextNodeId: 'human_agent' },
                { text: 'Eventos sazonais (Natal Luz, Fenavindima)', nextNodeId: 'seasonal_packages' }
            ]
        },
        'travel_packages': {
            message: 'Oferecemos pacotes incríveis para o Rio Grande do Sul! Como prefere filtrar sua experiência?',
            choices: [
                { text: 'Por destino', nextNodeId: 'destinations_filter' },
                { text: 'Por tipo de viagem', nextNodeId: 'type_filter' },
                { text: 'Por faixa de preço', nextNodeId: 'price_filter' },
                { text: 'Voltar ao início', nextNodeId: 'start' }
            ]
        },
        'destinations_filter': {
            message: 'Escolha um destino no Rio Grande do Sul:',
            choices: [
                { text: 'Serra Gaúcha (Gramado, Canela, Bento Gonçalves)', nextNodeId: 'serra_gaucha' },
                { text: 'Porto Alegre e arredores', nextNodeId: 'porto_alegre' },
                { text: 'Missões e história', nextNodeId: 'missoes' },
                { text: 'Praias (Torres, Capão da Canoa)', nextNodeId: 'praias' },
                { text: 'Voltar aos filtros', nextNodeId: 'travel_packages' }
            ]
        },
        'type_filter': {
            message: 'Que tipo de viagem você busca?',
            choices: [
                { text: 'Romântica', nextNodeId: 'romantic_package' },
                { text: 'Familiar', nextNodeId: 'family_package' },
                { text: 'Aventura', nextNodeId: 'adventure_package' },
                { text: 'Voltar aos filtros', nextNodeId: 'travel_packages' }
            ]
        },
        'price_filter': {
            message: 'Qual é a sua faixa de preço por pessoa?',
            choices: [
                { text: 'Econômico (até R$1.000)', nextNodeId: 'budget_package' },
                { text: 'Intermediário (R$1.000 - R$2.500)', nextNodeId: 'midrange_package' },
                { text: 'Premium (acima de R$2.500)', nextNodeId: 'premium_package' },
                { text: 'Voltar aos filtros', nextNodeId: 'travel_packages' }
            ]
        },
        'romantic_package': {
            message: 'Pacotes românticos são ideais para Gramado ou vinícolas em Bento Gonçalves. Deseja um roteiro personalizado?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'family_package': {
            message: 'Pacotes familiares incluem parques em Canela ou atividades em Porto Alegre. Quer mais detalhes?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'adventure_package': {
            message: 'Aventura em Torres (praias e trilhas) ou Serra Gaúcha (rapel e trilhas). Interessa um pacote?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'budget_package': {
            message: 'Pacotes econômicos para Porto Alegre ou Capão da Canoa. Deseja um orçamento detalhado?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'get_quote' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'midrange_package': {
            message: 'Pacotes intermediários para Gramado ou Bento Gonçalves. Quer mais detalhes?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'get_quote' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'premium_package': {
            message: 'Pacotes premium com hotéis de luxo em Gramado ou vinícolas exclusivas. Interessa um roteiro?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'serra_gaucha': {
            message: 'A Serra Gaúcha é perfeita para vinícolas, gastronomia e charme! Interessa algum destino específico?',
            choices: [
                { text: 'Gramado e Canela', nextNodeId: 'gramado_canela' },
                { text: 'Bento Gonçalves (Rota do Vinho)', nextNodeId: 'bento_goncalves' },
                { text: 'Voltar aos pacotes', nextNodeId: 'travel_packages' }
            ]
        },
        'gramado_canela': {
            message: 'Gramado e Canela oferecem parques, fondue e eventos como o Natal Luz. Quer um pacote personalizado?',
            choices: [
                { text: 'Sim, personalizado!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar à Serra Gaúcha', nextNodeId: 'serra_gaucha' }
            ]
        },
        'bento_goncalves': {
            message: 'Bento Gonçalves é famosa pela Rota do Vinho e passeios de Maria Fumaça. Deseja mais detalhes?',
            choices: [
                { text: 'Sim, mais detalhes!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar à Serra Gaúcha', nextNodeId: 'serra_gaucha' }
            ]
        },
        'porto_alegre': {
            message: 'Porto Alegre combina cultura, gastronomia e o pôr do sol no Guaíba. Que tipo de experiência busca?',
            choices: [
                { text: 'Cultura e museus', nextNodeId: 'poa_culture' },
                { text: 'Gastronomia e vida noturna', nextNodeId: 'poa_gastronomy' },
                { text: 'Voltar aos pacotes', nextNodeId: 'travel_packages' }
            ]
        },
        'poa_culture': {
            message: 'Visite o Museu de Arte do RS ou a Casa de Cultura Mario Quintana! Quer um roteiro cultural?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar a Porto Alegre', nextNodeId: 'porto_alegre' }
            ]
        },
        'poa_gastronomy': {
            message: 'Porto Alegre tem churrascarias incríveis e bares no Cidade Baixa. Posso sugerir um pacote gastronômico?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar a Porto Alegre', nextNodeId: 'porto_alegre' }
            ]
        },
        'missoes': {
            message: 'As Missões Jesuíticas, como São Miguel das Missões, oferecem história e cultura. Interessa um pacote histórico?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar aos pacotes', nextNodeId: 'travel_packages' }
            ]
        },
        'praias': {
            message: 'Torres e Capão da Canoa têm praias lindas e ótimos passeios. Quer um pacote de praia?',
            choices: [
                { text: 'Sim, mais detalhes!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' },
                { text: 'Voltar aos pacotes', nextNodeId: 'travel_packages' }
            ]
        },
        'custom_package': {
            message: 'Ótimo! Um consultor entrará em contato para personalizar seu pacote pelo Rio Grande do Sul. Algo mais?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'start' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'booking_support': {
            message: 'Como posso ajudar com sua reserva no Rio Grande do Sul?',
            choices: [
                { text: 'Alterar reserva', nextNodeId: 'change_booking' },
                { text: 'Cancelar reserva', nextNodeId: 'cancel_booking' },
                { text: 'Confirmar reserva', nextNodeId: 'confirm_booking' },
                { text: 'Voltar ao início', nextNodeId: 'start' }
            ]
        },
        'change_booking': {
            message: 'Para alterar sua reserva, informe o número da reserva e entraremos em contato.',
            choices: [
                { text: 'Ok, fornecer número.', nextNodeId: 'human_agent' },
                { text: 'Voltar ao suporte', nextNodeId: 'booking_support' }
            ]
        },
        'cancel_booking': {
            message: 'Para cancelar, precisamos do número da reserva. Deseja prosseguir?',
            choices: [
                { text: 'Sim, prosseguir.', nextNodeId: 'human_agent' },
                { text: 'Voltar ao suporte', nextNodeId: 'booking_support' }
            ]
        },
        'confirm_booking': {
            message: 'Confirme sua reserva com o número ou consulte seu e-mail. Posso ajudar com isso?',
            choices: [
                { text: 'Sim, ajudar.', nextNodeId: 'human_agent' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'destinations': {
            message: 'Quer saber mais sobre um destino específico no Rio Grande do Sul ou prefere recomendações gerais?',
            choices: [
                { text: 'Destino específico', nextNodeId: 'specific_destination' },
                { text: 'Recomendações gerais', nextNodeId: 'general_recommendations' },
                { text: 'Voltar ao início', nextNodeId: 'start' }
            ]
        },
        'specific_destination': {
            message: 'Informe o destino no Rio Grande do Sul e enviaremos informações detalhadas!',
            choices: [
                { text: 'Ok, fornecer destino.', nextNodeId: 'human_agent' },
                { text: 'Voltar ao início', nextNodeId: 'start' }
            ]
        },
        'general_recommendations': {
            message: 'Recomendamos Gramado, Bento Gonçalves, Porto Alegre ou Torres para 2025! Quer detalhes sobre algum deles?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'travel_packages' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'get_quote': {
            message: 'Um orçamento detalhado para sua viagem no Rio Grande do Sul será enviado por e-mail. Algo mais?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'start' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'human_agent': {
            message: 'Entendido! Estou transferindo você para um consultor de viagens da South Horizon Travel. Aguarde.',
            choices: [
                { text: 'Ok, aguardar.', nextNodeId: 'end_conversation' }
            ]
        },
        'end_conversation': {
            message: 'A South Horizon Travel agradece sua escolha! Explore o Rio Grande do Sul com toda a vibração do laranja. Esperamos te ver em breve!',
            choices: [
                { text: 'Iniciar nova conversa', nextNodeId: 'start' }
            ]
        },
        'seasonal_packages': {
            message: 'Temos pacotes especiais para eventos no Rio Grande do Sul! Qual te interessa?',
            choices: [
                { text: 'Natal Luz em Gramado', nextNodeId: 'natal_luz' },
                { text: 'Fenavindima em Bento Gonçalves', nextNodeId: 'fenavindima' },
                { text: 'Oktoberfest em Santa Cruz', nextNodeId: 'oktoberfest' },
                { text: 'Voltar ao início', nextNodeId: 'start' }
            ]
        },
        'natal_luz': {
            message: 'O Natal Luz em Gramado é mágico, com shows e decorações! Quer um pacote para dezembro?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'fenavindima': {
            message: 'A Fenavindima celebra a colheita de uvas em Bento Gonçalves. Interessa um pacote para março?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        },
        'oktoberfest': {
            message: 'A Oktoberfest em Santa Cruz do Sul é cheia de cultura e cerveja! Quer um pacote para outubro?',
            choices: [
                { text: 'Sim, por favor!', nextNodeId: 'custom_package' },
                { text: 'Não, obrigado(a).', nextNodeId: 'end_conversation' }
            ]
        }
    };

    let currentNodeId = 'start';

    // --- Helper Functions ---
    function showMessage(message) {
        if (messageText) {
            messageText.textContent = message;
            messageBox.style.display = 'flex';
        } else {
            console.error('Erro: messageText não encontrado.');
        }
    }

    function hideMessage() {
        if (messageBox) {
            messageBox.style.display = 'none';
        }
    }

    function addMessageToDisplay(text, sender) {
        if (!conversationDisplay) {
            console.error('Erro: conversationDisplay não encontrado.');
            return;
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        conversationDisplay.appendChild(messageDiv);
        conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    }

    function displayNode(nodeId) {
        const node = conversationNodes[nodeId];
        if (!node) {
            console.error(`Erro: Nó de conversa '${nodeId}' não encontrado.`);
            addMessageToDisplay('Erro: Não encontramos essa opção. Tente novamente.', 'bot');
            choicesArea.innerHTML = '';
            return;
        }

        addMessageToDisplay(node.message, 'bot');
        choicesArea.innerHTML = '';

        node.choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice.text;
            button.addEventListener('click', () => handleChoice(choice.text, choice.nextNodeId));
            choicesArea.appendChild(button);
        });
    }

    function handleChoice(choiceText, nextNodeId) {
        addMessageToDisplay(choiceText, 'user');
        currentNodeId = nextNodeId;
        displayNode(currentNodeId);
    }

    function restartConversation() {
        if (confirm('Tem certeza que deseja reiniciar a conversa?')) {
            conversationDisplay.innerHTML = '';
            currentNodeId = 'start';
            displayNode(currentNodeId);
        }
    }

    function updateEmailLink() {
        const emailLink = document.getElementById('email-link');
        const userEmail = localStorage.getItem('userEmail');
        if (emailLink && userEmail) {
            emailLink.href = `mailto:southhorizontravel@gmail.com?cc=${encodeURIComponent(userEmail)}`;
            console.log(`Link de e-mail atualizado: ${emailLink.href}`);
        } else {
            emailLink.href = 'mailto:southhorizontravel@gmail.com';
            console.log('Link de e-mail padrão, sem e-mail do usuário.');
        }
    }

    // --- Authentication System ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const registerUsername = document.getElementById('register-username');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerBtn = document.getElementById('register-btn');
    const registerError = document.getElementById('register-error');
    const showLoginBtn = document.getElementById('show-login-btn');

    if (authModal && loginForm && registerForm && loginUsername && loginPassword && loginBtn && loginError &&
        showRegisterBtn && registerUsername && registerEmail && registerPassword && registerBtn && 
        registerError && showLoginBtn && chatContainer) {
        console.log('Elementos de autenticação encontrados. Verificando estado de login...');

        // Alternar entre login e cadastro
        showRegisterBtn.addEventListener('click', () => {
            console.log('Exibindo formulário de cadastro.');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginError.style.display = 'none';
            loginUsername.value = '';
            loginPassword.value = '';
        });

        showLoginBtn.addEventListener('click', () => {
            console.log('Exibindo formulário de login.');
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            registerError.style.display = 'none';
            registerUsername.value = '';
            registerEmail.value = '';
            registerPassword.value = '';
        });

        // Cadastro
        registerBtn.addEventListener('click', () => {
            const username = registerUsername.value.trim();
            const email = registerEmail.value.trim();
            const password = registerPassword.value.trim();
            console.log(`Tentativa de cadastro com usuário: ${username}, e-mail: ${email}`);

            if (!username || !email || !password) {
                registerError.textContent = 'Por favor, preencha todos os campos.';
                registerError.style.display = 'block';
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (users[username] || Object.values(users).some(user => user.email === email)) {
                registerError.textContent = 'Usuário ou e-mail já existe.';
                registerError.style.display = 'block';
                return;
            }

            users[username] = { email, password };
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('userEmail', email);
            console.log(`Usuário ${username} cadastrado com sucesso. E-mail: ${email}`);
            registerError.style.display = 'none';
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            registerUsername.value = '';
            registerEmail.value = '';
            registerPassword.value = '';
            showMessage('Cadastro realizado! Faça login para continuar.');
            updateEmailLink();
        });

        // Login Manual
        loginBtn.addEventListener('click', () => {
            const username = loginUsername.value.trim();
            const password = loginPassword.value.trim();
            console.log(`Tentativa de login manual com usuário: ${username}`);

            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const defaultCredentials = username === 'user' && password === 'pass';

            if (defaultCredentials || (users[username] && users[username].password === password)) {
                console.log('Login manual bem-sucedido.');
                localStorage.setItem('loggedIn', 'true');
                if (users[username]) {
                    localStorage.setItem('userEmail', users[username].email);
                } else {
                    localStorage.setItem('userEmail', 'user@example.com');
                }
                authModal.style.display = 'none';
                chatContainer.style.display = 'flex';
                loginUsername.value = '';
                loginPassword.value = '';
                loginError.style.display = 'none';
                updateEmailLink();
                displayNode(currentNodeId);
            } else {
                console.log('Credenciais manuais inválidas.');
                loginError.textContent = 'Credenciais inválidas. Tente novamente.';
                loginError.style.display = 'block';
            }
        });

        // Verifica estado de login
        if (localStorage.getItem('loggedIn') === 'true') {
            console.log('Usuário já logado, exibindo chat.');
            authModal.style.display = 'none';
            chatContainer.style.display = 'flex';
            updateEmailLink();
            displayNode(currentNodeId);
        } else {
            console.log('Usuário não logado, exibindo modal de autenticação.');
            authModal.style.display = 'flex';
            chatContainer.style.display = 'none';
        }
    } else {
        console.error('Erro: Elementos de autenticação não encontrados.');
        showMessage('Erro: Elementos de autenticação não encontrados. Recarregue a página.');
    }

    // --- Event Listeners ---
    restartButton.addEventListener('click', restartConversation);
    closeMessageBtn.addEventListener('click', hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            hideMessage();
        }
    });

    const userInput = document.getElementById('user-input');
    const sendInputBtn = document.getElementById('send-input');

    if (userInput && sendInputBtn) {
        sendInputBtn.addEventListener('click', () => {
            const inputText = userInput.value.trim().toLowerCase();
            if (!inputText) {
                showMessage('Por favor, digite uma pergunta ou filtro.');
                return;
            }
            addMessageToDisplay(inputText, 'user');
            if (inputText.includes('gramado') || inputText.includes('canela')) {
                currentNodeId = 'gramado_canela';
            } else if (inputText.includes('bento') || inputText.includes('vinho')) {
                currentNodeId = 'bento_goncalves';
            } else if (inputText.includes('porto alegre')) {
                currentNodeId = 'porto_alegre';
            } else if (inputText.includes('missões') || inputText.includes('são miguel')) {
                currentNodeId = 'missoes';
            } else if (inputText.includes('torres') || inputText.includes('capão') || inputText.includes('praia')) {
                currentNodeId = 'praias';
            } else {
                addMessageToDisplay('Desculpe, não entendi. Tente especificar um destino, como "Gramado" ou "praias".', 'bot');
                currentNodeId = 'start';
            }
            userInput.value = '';
            displayNode(currentNodeId);
        });
    } else {
        console.error('Erro: Elementos de entrada de texto não encontrados.');
    }

    // --- Initialization ---
    try {
        console.log('Inicializando o chat...');
        updateEmailLink();
    } catch (error) {
        console.error('Erro ao inicializar o chat:', error);
        addMessageToDisplay('Erro ao iniciar o chat. Por favor, tente novamente.', 'bot');
    }
});