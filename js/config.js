window.APP_CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    app: {
        name: 'Выставочный стенд КЦТ',
        version: '1.0.0',
        language: 'ru'
    },
    
    form: {
        requiredFields: ['name', 'phone', 'direction'],
        timeout: 10000
    },
    
    games: {
        enabled: true,
        saveToDB: true
    },
    
    contacts: {
        email: 'info@kct.ru',
        phone: '+7 (___) ___-__-__',
        address: 'Адрес выставочного стенда'
    },
    
    analytics: {
        enabled: false,
        trackingId: ''
    }
};

console.log('App Config loaded:', window.APP_CONFIG.app.name, 'v' + window.APP_CONFIG.app.version);

if (window.APP_CONFIG.apiUrl.includes('YOUR_SCRIPT_ID')) {
    console.warn('⚠️ ВНИМАНИЕ: URL Google Apps Script не настроен! Обновите apiUrl в js/config.js');
}
