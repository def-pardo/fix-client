document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const btnContent = loginButton.querySelector('.btn-content');
    const errorPlaceholder = document.getElementById('error-alert-placeholder');

    firebase.auth().onAuthStateChanged(user => {
        if (user) window.location.href = '/index.html';
    });

    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            loginButton.disabled = true;
            const originalContent = btnContent.innerHTML;
            btnContent.innerHTML = `<span style="opacity:0.7">Autenticando...</span>`;

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            try {
                await firebase.auth().signInWithPopup(provider);
            } catch (error) {
                console.error('Login error:', error);

                loginButton.disabled = false;
                btnContent.innerHTML = originalContent;

                showError("Credenciales no verificadas. Intente nuevamente.");
            }
        });
    }

    function showError(message) {
        if (!errorPlaceholder) return;
        errorPlaceholder.innerHTML = `
            <div class="alert-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                ${message}
            </div>
        `;
    }
});