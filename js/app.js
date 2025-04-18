let tasks = [];
let currentFilter = 'all';
let deferredPrompt;

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const notificationsBtn = document.getElementById('notifications-btn');
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const closeBannerBtn = document.getElementById('close-banner-btn');

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    setupEventListeners();
    setupNotificationStatus();
    
    setInterval(checkTasksForNotification, 2 * 60 * 60 * 1000);
});

function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    notificationsBtn.addEventListener('click', toggleNotifications);

    installBtn.addEventListener('click', installApp);
    closeBannerBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
        localStorage.setItem('installBannerClosed', 'true');
    });
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    taskInput.value = '';
    renderTasks();
    
    if (Notification.permission === 'granted') {
        sendNotification('Новая задача добавлена', `"${taskText}" добавлена в ваш список`);
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = [];
    if (currentFilter === 'all') {
        filteredTasks = tasks;
    } else if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        if (task.completed) taskText.classList.add('completed');
        taskText.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-task-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteBtn);
        
        taskList.appendChild(taskItem);
    });

    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCount.textContent = `${activeTasks} задач осталось`;
}

async function toggleNotifications() {
    if (Notification.permission === 'granted') {
        localStorage.setItem('notificationsEnabled', 'false');
        notificationsBtn.textContent = 'Включить уведомления';
        notificationsBtn.classList.remove('disabled');
    } else {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            localStorage.setItem('notificationsEnabled', 'true');
            notificationsBtn.textContent = 'Отключить уведомления';
            notificationsBtn.classList.add('disabled');
            
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                } catch (error) {
                    console.error('Ошибка регистрации для push-уведомлений:', error);
                }
            }
        }
    }
    
    setupNotificationStatus();
}

function setupNotificationStatus() {
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    
    if (Notification.permission === 'granted' && notificationsEnabled) {
        notificationsBtn.textContent = 'Отключить уведомления';
        notificationsBtn.classList.add('disabled');
    } else {
        notificationsBtn.textContent = 'Включить уведомления';
        notificationsBtn.classList.remove('disabled');
    }
}

function sendNotification(title, body) {
    if (!('Notification' in window)) {
        console.log('Этот браузер не поддерживает уведомления');
        return;
    }
    
    if (Notification.permission === 'granted' && localStorage.getItem('notificationsEnabled') === 'true') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: './images/icons/placeholder.html',
                vibrate: [200, 100, 200],
                badge: './images/icons/placeholder.html'
            });
        });
    }
}

function checkTasksForNotification() {
    if (Notification.permission !== 'granted' || localStorage.getItem('notificationsEnabled') !== 'true') {
        return;
    }
    
    const activeTasks = tasks.filter(task => !task.completed);
    if (activeTasks.length > 0) {
        sendNotification(
            'Напоминание о задачах', 
            `У вас ${activeTasks.length} невыполненных задач`
        );
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (localStorage.getItem('installBannerClosed') !== 'true') {
        installBanner.style.display = 'flex';
    }
});

function installApp() {
    if (!deferredPrompt) {
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Пользователь установил приложение');
            installBanner.style.display = 'none';
        }
        deferredPrompt = null;
    });
} 