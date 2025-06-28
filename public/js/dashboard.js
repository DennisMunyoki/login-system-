document.addEventListener('DOMContentLoaded', function() {
    const welcomeUsername = document.getElementById('welcomeUsername');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const currentDate = document.getElementById('currentDate');
    const homeBtn = document.getElementById('homeBtn');
    const profileBtn = document.getElementById('profileBtn');
    const surveyBtn = document.getElementById('surveyBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const homeContent = document.getElementById('homeContent');
    const profileContent = document.getElementById('profileContent');
    const surveyContent = document.getElementById('surveyContent');
    const surveyForm = document.getElementById('surveyForm');
    const surveyMessage = document.getElementById('surveyMessage');

    async function fetchUserData() {
        try {
            const response = await fetch('/getUser');
            const user = await response.json();

            if (!user) {
                window.location.href = '/';
                return;
            }

            welcomeUsername.textContent = user.username;
            profileUsername.textContent = user.username;
            profileEmail.textContent = user.email;

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDate.textContent = new Date().toLocaleDateString('en-US', options);
        } catch (error) {
            console.error('Error fetching user:', error);
            window.location.href = '/';
        }
    }

    function showSection(section, button) {
        [homeContent, profileContent, surveyContent].forEach(sec => {
            sec.classList.add('hidden');
        });

        section.classList.remove('hidden');

        [homeBtn, profileBtn, surveyBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(homeContent, homeBtn);
    });

    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(profileContent, profileBtn);
    });

    surveyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(surveyContent, surveyBtn);
    });

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await fetch('/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(surveyForm);
        const surveyData = {};
        
        for (let [key, value] of formData.entries()) {
            surveyData[key] = value;
        }

        try {
            const response = await fetch('/submitSurvey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(surveyData)
            });

            const data = await response.json();

            if (data.success) {
                surveyMessage.textContent = 'Survey submitted successfully!';
                surveyMessage.className = 'message success';
                surveyForm.reset();
                setTimeout(() => {
                    showSection(homeContent, homeBtn);
                    surveyMessage.textContent = '';
                }, 1500);
            } else {
                surveyMessage.textContent = data.message || 'Survey submission failed';
                surveyMessage.className = 'message error';
            }
        } catch (error) {
            console.error('Survey error:', error);
            surveyMessage.textContent = 'An error occurred';
            surveyMessage.className = 'message error';
        }
    });

    fetchUserData();
});