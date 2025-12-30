/**
 * FIX 
 */

const App = {
    user: null,
    functions: null,
    voiceEnabled: false,
    synth: window.speechSynthesis,

    init() {
        console.log("Sistema Fix Inicializando...");

        // 1. Listener de Autenticación 
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // CASO A: Usuario Autenticado
                console.log('Acceso Autorizado:', user.email);

                // Guardamos la referencia del usuario
                this.user = user;

                // Inicializamos la UI 
                this.renderUserProfile();
                this.removeLoadingOverlay(); // Quitamos el loader aquí, cuando es seguro

            } else {
                // CASO B: Usuario No Identificado
                console.warn("Acceso Denegado.");

                // Redirección de seguridad al Login
                window.location.href = '/login.html';
            }
        });

        // 2. Fallback de Seguridad 
        setTimeout(() => {
            const loader = document.getElementById('fix-overlay');
            if (loader && !loader.classList.contains('hidden')) {
                // Solo forzamos si tenemos usuario, si no, dejemos que redirija
                if (this.user) {
                    console.warn("Timeout de carga: Forzando apertura de interfaz.");
                    this.removeLoadingOverlay();
                }
            }
        }, 8000); // Aumentado a 8s para dar tiempo a la redirección si es necesaria

        this.bindEvents();
        this.adjustTextareaHeight();
        this.initSingularityEffects();
    },

    removeLoadingOverlay() {
        const loader = document.getElementById('fix-overlay');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 1000);
        }
    },

    initSingularityEffects() {
        // Partículas
        if (typeof particlesJS !== 'undefined') {
            particlesJS("particles-js", {
                "particles": {
                    "number": { "value": 40, "density": { "enable": true, "value_area": 1000 } },
                    "color": { "value": "#ffffff" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.3, "random": true },
                    "size": { "value": 1.5, "random": true },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#4f5b75",
                        "opacity": 0.1,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 0.5,
                        "direction": "none",
                        "random": true,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false } },
                    "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.3 } } }
                },
                "retina_detect": true
            });
        }

        // Magnetismo y Tilt
        if (typeof gsap !== 'undefined') {
            const magneticBtns = document.querySelectorAll('.magnetic-btn');
            magneticBtns.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    gsap.to(btn, { duration: 0.3, x: x * 0.3, y: y * 0.3, ease: "power2.out" });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { duration: 0.5, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
                });
            });
        }

        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.05
            });
        }
    },

    bindEvents() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        if (input) {
            input.addEventListener('input', () => {
                this.adjustTextareaHeight();
                if (sendBtn) sendBtn.disabled = input.value.trim() === '';
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }

        if (sendBtn) sendBtn.addEventListener('click', () => this.handleSendMessage());

        // Toggle Voz
        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('change', (e) => {
                this.voiceEnabled = e.target.checked;
                if (!this.voiceEnabled) this.synth.cancel();
            });
        }

        // Nueva Consulta
        const newChatBtn = document.getElementById('btn-new-chat');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                const container = document.getElementById('messages-container');
                const emptyState = document.getElementById('empty-state');
                if (container) container.innerHTML = '';
                if (emptyState) {
                    container.appendChild(emptyState);
                    emptyState.style.display = 'block';
                }
                if (input) input.focus();
            });
        }
        //consulta
        const currentconsultaBtn = document.getElementById('btn-current-consulta');
        if (currentconsultaBtn) {
            currentconsultaBtn.addEventListener('click', () => {
                console.log("Re-sincronizando vista de consulta...");

                // 1. Feedback visual (pequeña animación de parpadeo en el contenedor)
                const container = document.getElementById('messages-container');
                container.style.opacity = '0.5';
                setTimeout(() => container.style.opacity = '1', 200);

                // 2. Funcionalidad: Scroll al fondo y Focus
                ChatUI.scrollToBottom();
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            });
        }
        // Logout
        const profileBtn = document.getElementById('user-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('user-menu').classList.toggle('show');
            });
        }

        document.addEventListener('click', () => {
            const menu = document.getElementById('user-menu');
            if (menu) menu.classList.remove('show');
        });
    },

    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();

        if (!text) return;

        // Easter Egg
        if (text.toLowerCase().includes('hyperdrive') || text.toLowerCase().includes('velocidad luz')) {
            document.body.classList.add('hyperdrive-active');
            setTimeout(() => document.body.classList.remove('hyperdrive-active'), 5000);
        }

        input.value = '';
        input.style.height = 'auto';
        document.getElementById('send-btn').disabled = true;

        const emptyState = document.getElementById('empty-state');
        if (emptyState) emptyState.style.display = 'none';

        ChatUI.appendMessage('user', text);
        const loadingId = ChatUI.appendLoading();

        const avatar = document.getElementById('ai-avatar');
        if (avatar) avatar.classList.add('processing');

        try {
            // 1. Configuración
            // Verifica que esta URL sea la CORRECTA del backend
            const GATEWAY_URL = "https://fix-backend-gateway-782810224158.southamerica-east1.run.app/api/chat";

            if (!this.user) throw new Error("Sesión no válida. Recarga la página.");
            const token = await this.user.getIdToken();

            // 2. Preparar datos 
            const payload = {
                query: text,
                history: []
            };

            // 3. Petición al Servidor
            const response = await fetch(GATEWAY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // 4. Manejo de Errores 
            if (!response.ok) {
                const errorData = await response.json();
                console.error(" ERROR DEL SERVIDOR:", errorData);

                // Convertir el objeto JSON a texto para verlo en la alerta
                let errorMessage = "Error desconocido";
                if (errorData.detail) {
                    errorMessage = JSON.stringify(errorData.detail);
                } else {
                    errorMessage = JSON.stringify(errorData);
                }

                throw new Error(`Servidor responde: ${errorMessage}`);
            }

            const result = await response.json();

            // 5. Éxito
            ChatUI.removeMessage(loadingId);
            if (avatar) {
                avatar.classList.remove('processing');
                avatar.classList.add('speaking');
            }

            await ChatUI.typeMessage('bot', result.response || "Sin respuesta.");

            if (this.voiceEnabled) this.speak(result.response || "");
            if (avatar) avatar.classList.remove('speaking');

        } catch (error) {
            console.error(error);
            ChatUI.removeMessage(loadingId);
            if (avatar) avatar.classList.remove('processing');
            // Aquí mostramos el error real en el chat
            ChatUI.appendMessage('bot', ` **Error**: ${error.message}`);
        }
    },

    speak(text) {
        if (!this.synth) return;
        const cleanText = text.replace(/[*#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.1;

        const voices = this.synth.getVoices();
        const esVoice = voices.find(v => v.lang.includes('es'));
        if (esVoice) utterance.voice = esVoice;

        this.synth.speak(utterance);
    },

    adjustTextareaHeight() {
        const el = document.getElementById('chat-input');
        if (el) {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight < 200 ? el.scrollHeight : 200) + "px";
        }
    },

    renderUserProfile() {
        if (!this.user) return;

        const nameEl = document.getElementById('user-name');
        const avatarEl = document.querySelector('.avatar');

        if (nameEl) {
            nameEl.textContent = this.user.displayName || this.user.email.split('@')[0];
        }

        if (avatarEl) {
            if (this.user.photoURL) {
                avatarEl.textContent = '';
                avatarEl.style.backgroundImage = `url('${this.user.photoURL}')`;
                avatarEl.style.backgroundSize = 'cover';
            } else {
                const initial = (this.user.displayName || this.user.email).charAt(0).toUpperCase();
                avatarEl.textContent = initial;
            }
        }
    },

    logout() {
        console.log("Cerrando Sesión...");
        firebase.auth().signOut().then(() => {
            window.location.href = '/login.html';
        });
    }
};

const ChatUI = {
    container: document.getElementById('messages-container'),

    appendMessage(role, text) {
        if (!this.container) return;
        const msgId = 'msg-' + Date.now();
        const isBot = role === 'bot';

        let content = text;
        if (isBot && typeof marked !== 'undefined') {
            content = marked.parse(text);
        } else {
            const div = document.createElement('div');
            div.textContent = text;
            content = div.innerHTML.replace(/\n/g, '<br>');
        }

        const html = `
            <div class="message-row" id="${msgId}">
                <div class="message-content">
                    <div class="message-role ${isBot ? 'role-bot' : 'role-user'}">
                        ${isBot ? '<i class="fas fa-bolt"></i>' : '<i class="fas fa-user"></i>'}
                    </div>
                    <div class="message-text">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();

        if (isBot && typeof hljs !== 'undefined') {
            document.querySelectorAll(`#${msgId} pre code`).forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    },

    async typeMessage(role, text) {
        if (!this.container) return;
        const msgId = 'msg-' + Date.now();

        const html = `
            <div class="message-row" id="${msgId}">
                <div class="message-content">
                    <div class="message-role role-bot">
                        <i class="fa-solid fa-atom"></i>
                    </div>
                    <div class="message-text typing-cursor"></div>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();

        const msgElement = document.getElementById(msgId).querySelector('.message-text');

        // Velocidad de tipeo
        const delay = 10;

        return new Promise(resolve => {
            let i = 0;
            const interval = setInterval(() => {
                msgElement.textContent += text.charAt(i);
                if (i % 10 === 0) this.scrollToBottom();

                i++;
                if (i > text.length - 1) {
                    clearInterval(interval);
                    msgElement.classList.remove('typing-cursor');

                    if (typeof marked !== 'undefined') {
                        msgElement.innerHTML = marked.parse(text);
                    }
                    if (typeof hljs !== 'undefined') {
                        msgElement.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                    }
                    this.scrollToBottom();
                    resolve();
                }
            }, delay);
        });
    },

    appendLoading() {
        if (!this.container) return;
        const id = 'loading-' + Date.now();

        // Mensajes rotativos 
        const thinkingMessages = [
            "Analizando contexto...",
            "Consultando red neural...",
            "Estructurando respuesta...",
            "Optimizando resultados...",
            "Finalizando..."
        ];

        const html = `
            <div class="message-row" id="${id}">
                <div class="message-content">
                    <div class="message-role role-bot" style="background: transparent; border: 1px solid var(--primary-accent);">
                        <div class="smart-loader"></div>
                    </div>
                    <div class="message-text">
                        <span class="loading-text" id="text-${id}">Procesando...</span>
                    </div>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();

        // Lógica de rotación de texto
        const textElement = document.getElementById(`text-${id}`);
        let msgIndex = 0;

        // Guardamos el intervalo en el elemento para poder detenerlo luego
        const intervalId = setInterval(() => {
            if (textElement) {
                textElement.style.opacity = '0.5';
                setTimeout(() => {
                    textElement.textContent = thinkingMessages[msgIndex];
                    textElement.style.opacity = '1';
                    msgIndex = (msgIndex + 1) % thinkingMessages.length;
                }, 200);
            }
        }, 2000);

        // Asignamos el ID del intervalo al elemento DOM para limpiarlo después
        const row = document.getElementById(id);
        if (row) row.dataset.interval = intervalId;

        return id;
    },

    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) {
            if (el.dataset.interval) {
                clearInterval(Number(el.dataset.interval));
            }
            el.remove();
        }
    },

    scrollToBottom() {
        if (this.container) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    },

    setInput(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            input.focus();
            input.dispatchEvent(new Event('input'));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());