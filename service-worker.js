const CACHE_NAME = 'task-list-cache-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/sw-register.js',
    './manifest.json',
    './images/icons/placeholder.html'
];

// Установка Service Worker и кэширование статических ресурсов
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Стратегия кэширования: сначала кэш, затем сеть
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Если ресурс найден в кэше, возвращаем его
                if (response) {
                    return response;
                }

                // Если ресурса нет в кэше, запрашиваем его из сети
                return fetch(event.request)
                    .then(networkResponse => {
                        // Если ответ невалидный, возвращаем его как есть
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Клонируем ответ, так как его тело может быть использовано только один раз
                        const responseToCache = networkResponse.clone();

                        // Добавляем ответ в кэш для будущих запросов
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Если сеть недоступна и ресурс не в кэше, можно вернуть запасной ресурс
                        if (event.request.url.indexOf('.html') > -1) {
                            return caches.match('./index.html');
                        }
                        
                        // Для запросов к иконкам возвращаем заглушку
                        if (event.request.url.indexOf('icon-') > -1) {
                            return caches.match('./images/icons/placeholder.html');
                        }
                    });
            })
    );
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
    let notificationData = {
        title: 'Умный список задач',
        body: 'Новое уведомление!',
        icon: './images/icons/placeholder.html',
        badge: './images/icons/placeholder.html'
    };

    // Если есть данные в push-сообщении, используем их
    if (event.data) {
        try {
            notificationData = JSON.parse(event.data.text());
        } catch (e) {
            console.error('Ошибка при парсинге данных push-уведомления:', e);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            vibrate: [200, 100, 200],
            data: notificationData.data
        })
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Открытие вкладки при клике на уведомление
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(windowClients => {
                // Проверяем, есть ли уже открытые вкладки с нашим приложением
                for (let client of windowClients) {
                    if (client.url.includes('./index.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Если нет, открываем новую вкладку
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
}); 