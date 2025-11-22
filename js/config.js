window.APP_CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
};

console.log('App Config loaded');

if (window.APP_CONFIG.apiUrl.includes('YOUR_SCRIPT_ID')) {
    console.warn('⚠️ ВНИМАНИЕ: URL Google Apps Script не настроен! Обновите apiUrl в js/config.js');
}
