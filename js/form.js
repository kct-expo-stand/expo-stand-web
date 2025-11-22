async function sendApplication(data) {
    try {
        const url = window.APP_CONFIG?.apiUrl || '';
        
        if (!url) {
            throw new Error('URL API не настроен. Проверьте файл config.js');
        }

        // showFormStatus('Отправка данных...', 'loading'); // Removed as we use button state

        const response = await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // showFormStatus('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success'); // Handled by button
        
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

        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnText = submitBtn.textContent;

        const formData = new FormData(form);
        const data = {
            user_id: '',
            username: 'стенд КЦТ',
            first_name: formData.get('name'),
            phone: formData.get('phone'),
            program: formData.get('direction')
        };

        if (!isValidPhone(data.phone)) {
            showFormStatus('Пожалуйста, введите корректный номер телефона', 'error');
            return;
        }

        // Set loading state
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Отправка...';
        
        // Hide previous messages
        const messageElement = document.getElementById('formMessage');
        if (messageElement) messageElement.style.display = 'none';

        const result = await sendApplication(data);

        submitBtn.classList.remove('loading');

        if (result.success) {
            // Set success state
            submitBtn.classList.add('success');
            submitBtn.textContent = 'Заявка отправлена!';
            
            form.reset();

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.classList.remove('success');
                submitBtn.textContent = originalBtnText;
            }, 3000);
        } else {
            // Revert to original state on error
            submitBtn.textContent = originalBtnText;
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
