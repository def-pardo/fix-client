document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const btnContentWrapper = loginButton ? loginButton.querySelector('.btn-content') : null;
    const errorPlaceholder = document.getElementById('error-alert-placeholder');

    if (typeof firebase !== 'undefined') {
        firebase.auth().onAuthStateChanged(user => {
            if (user) window.location.href = '/index.html';
        });
    }

    if (loginButton && btnContentWrapper) {
        loginButton.addEventListener('click', async () => {
            loginButton.disabled = true;
            const originalContent = btnContentWrapper.innerHTML;

            btnContentWrapper.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-void" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
            `;

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                await firebase.auth().signInWithPopup(provider);
            } catch (error) {
                console.error('Login error:', error);
                loginButton.disabled = false;
                btnContentWrapper.innerHTML = originalContent;
                showError("Credenciales no verificadas. Intente nuevamente.");
            }
        });
    }

    function showError(message) {
        if (!errorPlaceholder) return;
        errorPlaceholder.innerHTML = `
            <div class="flex items-center gap-3 p-4 text-sm text-red-200 bg-red-900/20 border border-red-500/20 rounded-lg animate-fade-in">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                    <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
                </svg>
                ${message}
            </div>
        `;
    }
});