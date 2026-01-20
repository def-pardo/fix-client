const App = {
    user: null,
    functions: null,
    voiceEnabled: false,
    synth: window.speechSynthesis,

    init() {
        console.log("Sistema Fix Inicializando...");

        if (typeof firebase !== 'undefined') {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    console.log('Acceso Autorizado:', user.email);
                    this.user = user;
                    this.renderUserProfile();
                    this.removeLoadingOverlay();
                } else {
                    console.warn("Acceso Denegado.");
                    window.location.href = '/login.html';
                }
            });
        }

        setTimeout(() => {
            const loader = document.getElementById('fix-overlay');
            if (loader && !loader.classList.contains('hidden')) {
                if (this.user) {
                    this.removeLoadingOverlay();
                }
            }
        }, 8000);

        this.bindEvents();
        this.adjustTextareaHeight();
        this.initSingularityEffects();
    },

    removeLoadingOverlay() {
        const loader = document.getElementById('fix-overlay');
        if (loader) {
            loader.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => loader.remove(), 1000);
        }
    },

    initSingularityEffects() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS("particles-js", {
                "particles": {
                    "number": { "value": 40, "density": { "enable": true, "value_area": 1000 } },
                    "color": { "value": "#ffffff" },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.3, "random": true },
                    "size": { "value": 1.5, "random": true },
                    "line_linked": { "enable": true, "distance": 150, "color": "#4f5b75", "opacity": 0.1, "width": 1 },
                    "move": { "enable": true, "speed": 0.5 }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": { "onhover": { "enable": true, "mode": "grab" } }
                }
            });
        }

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
                max: 5,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
                scale: 1.02
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

        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('change', (e) => {
                this.voiceEnabled = e.target.checked;
                if (!this.voiceEnabled) this.synth.cancel();
            });
        }

        const newChatBtn = document.getElementById('btn-new-chat');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                const container = document.getElementById('messages-container');
                const emptyState = document.getElementById('empty-state');
                if (container) container.innerHTML = '';
                if (emptyState) {
                    container.appendChild(emptyState);
                    emptyState.style.display = 'flex'; // Tailwind flex
                }
                if (input) input.focus();
            });
        }

        const currentconsultaBtn = document.getElementById('btn-current-consulta');
        if (currentconsultaBtn) {
            currentconsultaBtn.addEventListener('click', () => {
                ChatUI.scrollToBottom();
                if (input) input.focus();
            });
        }

        const profileBtn = document.getElementById('user-profile-btn');
        const userMenu = document.getElementById('user-menu');

        if (profileBtn && userMenu) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userMenu.classList.contains('hidden')) {
                    userMenu.classList.remove('hidden');
                    userMenu.classList.add('block', 'animate-[fadeInUp_0.2s_ease-out]');
                } else {
                    userMenu.classList.add('hidden');
                    userMenu.classList.remove('block');
                }
            });
        }

        document.addEventListener('click', () => {
            if (userMenu && !userMenu.classList.contains('hidden')) {
                userMenu.classList.add('hidden');
            }
        });
    },

    async handleSendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        if (text.toLowerCase().includes('hyperdrive')) {
            document.body.classList.add('animate-pulse');
            setTimeout(() => document.body.classList.remove('animate-pulse'), 5000);
        }

        input.value = '';
        input.style.height = 'auto';
        document.getElementById('send-btn').disabled = true;

        const emptyState = document.getElementById('empty-state');
        if (emptyState) emptyState.style.display = 'none';

        ChatUI.appendMessage('user', text);
        const loadingId = ChatUI.appendLoading();

        const avatar = document.getElementById('ai-avatar');
        if (avatar) avatar.firstElementChild.classList.add('text-primary', 'shadow-glow');

        try {
            const GATEWAY_URL = "https://fix-backend-gateway-782810224158.southamerica-east1.run.app/api/chat";

            if (!this.user) throw new Error("Sesión no válida.");
            const token = await this.user.getIdToken();

            const response = await fetch(GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ query: text, history: [] })
            });

            if (!response.ok) throw new Error("Error en conexión.");
            const result = await response.json();

            ChatUI.removeMessage(loadingId);
            if (avatar) avatar.firstElementChild.classList.remove('text-primary', 'shadow-glow');

            await ChatUI.typeMessage('bot', result.response || "Sin respuesta.");

            if (this.voiceEnabled) this.speak(result.response || "");

        } catch (error) {
            ChatUI.removeMessage(loadingId);
            ChatUI.appendMessage('bot', `**Error**: ${error.message}`);
        }
    },

    speak(text) {
        if (!this.synth) return;
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ''));
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

        if (nameEl) nameEl.textContent = this.user.displayName || this.user.email.split('@')[0];
        if (avatarEl) {
            if (this.user.photoURL) {
                avatarEl.textContent = '';
                avatarEl.style.backgroundImage = `url('${this.user.photoURL}')`;
                avatarEl.style.backgroundSize = 'cover';
            } else {
                avatarEl.textContent = (this.user.displayName || this.user.email).charAt(0).toUpperCase();
            }
        }
    },

    logout() {
        if (typeof firebase !== 'undefined') {
            firebase.auth().signOut().then(() => window.location.href = '/login.html');
        }
    }
};

const ChatUI = {
    container: document.getElementById('messages-container'),
    appendMessage(role, text) {
        if (!this.container) return;
        const msgId = 'msg-' + Date.now();
        const isBot = role === 'bot';

        let content = text;
        if (isBot && typeof marked !== 'undefined') content = marked.parse(text);
        else if (!isBot) {
            const div = document.createElement('div');
            div.textContent = text;
            content = div.innerHTML.replace(/\n/g, '<br>');
        }

        const alignClass = isBot ? 'justify-start' : 'justify-end';
        const bgClass = isBot ? 'bg-white/5 border-glass-border' : 'bg-primary/10 border-primary/20 text-white';
        const iconHtml = isBot ? '<i class="fas fa-bolt text-primary"></i>' : '<i class="fas fa-user text-slate-300"></i>';
        const roleIconBg = isBot ? 'bg-primary/10' : 'bg-white/10';

        const html = `
            <div class="flex w-full ${alignClass} animate-[fadeIn_0.3s_ease-out]" id="${msgId}">
                <div class="flex gap-4 max-w-3xl ${isBot ? 'flex-row' : 'flex-row-reverse'}">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg ${roleIconBg} flex items-center justify-center border border-white/5">
                        ${iconHtml}
                    </div>
                    <div class="relative px-5 py-4 rounded-2xl border ${bgClass} backdrop-blur-sm shadow-sm text-sm leading-relaxed overflow-hidden">
                        <div class="prose prose-invert prose-sm max-w-none message-content-text">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
        this.highlightCode(msgId);
    },

    async typeMessage(role, text) {
        if (!this.container) return;
        const msgId = 'msg-' + Date.now();

        const html = `
            <div class="flex w-full justify-start animate-[fadeIn_0.3s_ease-out]" id="${msgId}">
                <div class="flex gap-4 max-w-3xl">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-white/5">
                        <i class="fas fa-atom text-primary animate-pulse"></i>
                    </div>
                    <div class="relative px-5 py-4 rounded-2xl border bg-white/5 border-glass-border backdrop-blur-sm shadow-sm text-sm leading-relaxed">
                        <div class="prose prose-invert prose-sm max-w-none message-content-text typing-cursor"></div>
                    </div>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();

        const msgElement = document.getElementById(msgId).querySelector('.message-content-text');

        return new Promise(resolve => {
            let i = 0;
            const interval = setInterval(() => {
                msgElement.textContent += text.charAt(i);
                if (i % 20 === 0) this.scrollToBottom();
                i++;
                if (i > text.length - 1) {
                    clearInterval(interval);
                    msgElement.classList.remove('typing-cursor');
                    if (typeof marked !== 'undefined') msgElement.innerHTML = marked.parse(text);
                    this.highlightCode(msgId);
                    this.scrollToBottom();
                    resolve();
                }
            }, 5);
        });
    },

    appendLoading() {
        if (!this.container) return;
        const id = 'loading-' + Date.now();

        const html = `
            <div class="flex w-full justify-start animate-[fadeIn_0.3s_ease-out]" id="${id}">
                <div class="flex gap-4 items-center">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-transparent flex items-center justify-center">
                         <div class="w-3 h-3 bg-white rounded-full animate-ping"></div>
                    </div>
                    <span class="text-xs text-primary/70 font-mono tracking-widest animate-pulse">PROCESANDO DATOS...</span>
                </div>
            </div>
        `;
        this.container.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
        return id;
    },

    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    scrollToBottom() {
        if (this.container) this.container.scrollTop = this.container.scrollHeight;
    },

    setInput(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            input.focus();
            input.dispatchEvent(new Event('input'));
        }
    },

    highlightCode(msgId) {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll(`#${msgId} pre code`).forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());