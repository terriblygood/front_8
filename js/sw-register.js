// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('ServiceWorker зарегистрирован успешно:', registration.scope);
        } catch (error) {
            console.log('Регистрация ServiceWorker не удалась:', error);
        }
    });
} 