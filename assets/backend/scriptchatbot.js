document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const welcomeMessage = document.getElementById("welcome-message");
    const endpoint = "";
    const apiKey = "";
    const deployment = "";
    const apiVersion = "";


    // Função para adicionar mensagens ao chat
    function addMessage(text, sender) {
        const message = document.createElement("div");
        message.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        const icon = document.createElement("img");
        icon.classList.add("icon");
        icon.src = sender === "user" ? "/assets/img/icons/user_icon.svg" : "/assets/img/icons/bot_icon.svg";
        icon.alt = sender === "user" ? "Usuário" : "Bot";

        const textNode = document.createElement("span");
        textNode.innerHTML = marked.parse(text);

        message.appendChild(icon);
        message.appendChild(textNode);
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Função para chamar a Azure OpenAI
    function callAzureOpenAI(userText) {
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const loadingMessage = document.createElement("div");
        loadingMessage.classList.add("message", "bot-message");

        const icon = document.createElement("img");
        icon.classList.add("icon");
        icon.src = "/assets/img/icons/bot_icon.svg";

        const textNode = document.createElement("span");
        textNode.textContent = "Digitando...";

        loadingMessage.appendChild(icon);
        loadingMessage.appendChild(textNode);
        chatBox.appendChild(loadingMessage);

        chatBox.scrollTop = chatBox.scrollHeight;

        const config = {
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente gastronômico especializado em pizzas. Sua missão é ajudar os usuários a montar pizzas personalizadas, sugerir combinações de sabores, lidar com restrições alimentares e facilitar pedidos rápidos. Sempre seja amigável, criativo e direto nas respostas.
                    Situações reais de uso:
                    - Jantar com amigos: ajude o usuário a montar uma pizza que agrade a todos, equilibrando sabores.
                    - Pedido rápido: sugira opções práticas e populares.
                    - Exploração de novos sabores: ofereça sugestões criativas e ousadas.
                    - Dietas e restrições: filtre ingredientes conforme restrições como veganismo ou intolerância à lactose.
                    - Personalização: permita que o usuário escolha massa, molho, queijos, proteínas, vegetais e adicionais, criando uma pizza única.
                    - Pedido finalizado: quando o usuário solicitar o pedido, responda com "Pedido feito com sucesso. O tempo de espera é de 40min."

                    Sabores disponíveis:
                    - Carnes: Lombo, Toscana, Frango, Pepperoni, Carne Seca, Calabresa, Bacon, Picanha
                    - Frutos do mar: Atum, Camarão
                    - Queijos: 4 Queijos
                    - Tradicionais: Napolitana, Portuguesa, Marguerita, Mexicana
                    - Vegetais: Rúcula, Milho, Escarola, Palmito, Brócolis, Alcachofras, Shimeji
                    - Especiais: Vegetariana, Bruschetta

                    Seja sempre prestativo e torne a experiência divertida e saborosa!`


                },
                {
                    role: "user",
                    content: userText
                }
            ],
            max_tokens: 800,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify(config)
        })
            .then((response) => response.json())
            .then((result) => {
                const botReply = result.choices[0].message.content;

                chatBox.removeChild(loadingMessage);
                addMessage(botReply, "bot");
                console.log(botReply);
            })
            .catch((error) => {
                chatBox.removeChild(loadingMessage);
                addMessage(`Erro: ${error.message}`, "bot");
                console.error(error);
            });
    }

    // Evento de envio do formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const userText = input.value.trim();

        if (userText !== "") {
            // Oculta a saudação e mostra o chat-box
            if (welcomeMessage) {
                welcomeMessage.style.display = "none";
            }
            chatBox.style.display = "flex";

            addMessage(userText, "user");
            callAzureOpenAI(userText);
            input.value = "";
        }
    });

    function ajustarAlturaChatBox() {
        const header = document.querySelector("header");
        const footer = document.querySelector("#footer_chatbot");
        const chatBox = document.querySelector(".chat-box");

        const alturaHeader = header.offsetHeight;
        const alturaFooter = footer.offsetHeight;
        const alturaDisponivel = window.innerHeight - alturaHeader - alturaFooter;

        chatBox.style.maxHeight = `${alturaDisponivel}px`;
    }

    // Ajusta ao carregar
    window.addEventListener("load", ajustarAlturaChatBox);

    // Ajusta ao redimensionar a janela
    window.addEventListener("resize", ajustarAlturaChatBox);
});
