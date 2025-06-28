document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const message = document.getElementById('message');
    const regMessage = document.getElementById('regMessage');

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            showMessage(message, 'Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    showMessage(message, 'Login successful!', 'success');
                }
            } else {
                showMessage(message, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(message, 'An error occurred', 'error');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

        if (!username || !email || !password || !confirmPassword) {
            showMessage(regMessage, 'Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(regMessage, 'Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage(regMessage, 'Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(regMessage, 'Registration successful! Please login.', 'success');
                registerForm.reset();
                setTimeout(() => {
                    registerContainer.classList.add('hidden');
                    loginContainer.classList.remove('hidden');
                    regMessage.textContent = '';
                }, 2000);
            } else {
                showMessage(regMessage, data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(regMessage, 'An error occurred', 'error');
        }
    });

    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = 'message';
        element.classList.add(type);
    }
});