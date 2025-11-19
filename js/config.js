/**
 * Конфигурационный файл проекта
 * Здесь хранятся все настройки приложения
 */

window.APP_CONFIG = {
    // URL Google Apps Script Web App
    // ВАЖНО: Замените на ваш реальный URL после деплоя скрипта
    // Получить URL: Google Apps Script -> Deploy -> New deployment -> Web app
    apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // Настройки приложения
    app: {
        name: 'Выставочный стенд КЦТ',
        version: '1.0.0',
        language: 'ru'
    },
    
    // Настройки формы
    form: {
        maxMessageLength: 1000,
        requiredFields: ['name', 'email', 'message'],
        timeout: 10000 // Таймаут запроса в миллисекундах
    },
    
    // Настройки для будущих мини-игр
    games: {
        enabled: true,
        saveToDB: true
    },
    
    // Контактная информация
    contacts: {
        email: 'info@kct.ru',
        phone: '+7 (___) ___-__-__',
        address: 'Адрес выставочного стенда'
    },
    
    // Настройки аналитики (для будущего использования)
    analytics: {
        enabled: false,
        trackingId: ''
    }
};

// Вывод информации о конфигурации в консоль для отладки
console.log('App Config loaded:', window.APP_CONFIG.app.name, 'v' + window.APP_CONFIG.app.version);

// Предупреждение если API URL не настроен
if (window.APP_CONFIG.apiUrl.includes('YOUR_SCRIPT_ID')) {
    console.warn('⚠️ ВНИМАНИЕ: URL Google Apps Script не настроен! Обновите apiUrl в js/config.js');
}
