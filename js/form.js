async function sendApplication(data) {
    try {
        const url = window.APP_CONFIG?.apiUrl || '';
        
        if (!url) {
            throw new Error('URL API не настроен. Проверьте файл config.js');
        }

        showFormStatus('Отправка данных...', 'loading');

        const response = await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        showFormStatus('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
        
        return {
            success: true,
            message: 'Данные отправлены'
        };

    } catch (error) {
        console.error('Ошибка при отправке заявки:', error);
        showFormStatus('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.', 'error');
        
        return {
            success: false,
            error: error.message
        };
    }
}

function showFormStatus(message, type) {
    const messageElement = document.getElementById('formMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';

        if (type !== 'loading') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
}

function isValidPhone(phone) {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length >= 10;
}

function initApplicationForm() {
    const form = document.getElementById('applicationForm');
    
    if (!form) {
        console.warn('Форма заявки не найдена на странице');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            direction: formData.get('direction'),
            timestamp: new Date().toISOString(),
            source: 'expo-stand-web'
        };

        if (!isValidPhone(data.phone)) {
            showFormStatus('Пожалуйста, введите корректный номер телефона', 'error');
            return;
        }

        const result = await sendApplication(data);

        if (result.success) {
            form.reset();
        }
    });

    const resetButton = form.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            const messageElement = document.getElementById('formMessage');
            if (messageElement) {
                messageElement.style.display = 'none';
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplicationForm);
} else {
    initApplicationForm();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendApplication, showFormStatus, isValidPhone };
}
