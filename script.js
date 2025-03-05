let tasks = [];

// Request permission for notifications
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const taskInput = document.getElementById('task-input').value;
    const categoryInput = document.getElementById('category-input').value;
    const dueDateInput = document.getElementById('due-date-input').value;
    const dueTimeInput = document.getElementById('due-time-input').value;
    const priorityInput = document.getElementById('priority-input').value;
    const notesInput = document.getElementById('notes-input').value;
    const recurringInput = document.getElementById('recurring-input').value;

    const dueDateTime = new Date(`${dueDateInput}T${dueTimeInput}`);

    const task = {
        id: Date.now(),
        name: taskInput,
        category: categoryInput,
        dueDate: dueDateTime,
        priority: priorityInput,
        notes: notesInput,
        recurring: recurringInput,
        completed: false
    };

    tasks.push(task);
    renderTasks();
    this.reset();
    scheduleNotification(task); // Schedule notification for the new task
});

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    const sortBy = document.getElementById('sort-input').value;
    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === 'dueDate') {
            return a.dueDate - b.dueDate;
        } else {
            return a.priority.localeCompare(b.priority);
        }
    });

    sortedTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item';
        const countdown = getCountdown(task.dueDate);
        taskItem.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.name} - ${task.category} (Due: ${task.dueDate.toLocaleString()})</span>
            <span class="badge badge-${getPriorityBadge(task.priority)}">${task.priority}</span>
            <span class="countdown">${countdown}</span>
            <button class="btn btn-warning btn-sm" onclick="toggleComplete(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(taskItem);
        updateCountdown(task.dueDate, taskItem.querySelector('.countdown'));
    });
}

function getCountdown(dueDate) {
    const now = new Date();
    const timeDiff = dueDate - now;

    if (timeDiff <= 0) {
        return "Task is due!";
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days} day(s) left` : `${hours} hour(s) left`;
}

function updateCountdown(dueDate, countdownElement) {
    const interval = setInterval(() => {
        const countdown = getCountdown(dueDate);
        countdownElement.textContent = countdown;

        if (countdown === "Task is due!") {
            clearInterval(interval);
        }
    }, 1000);
}

function scheduleNotification(task) {
    const now = new Date();
    const notificationTime = new Date(task.dueDate.getTime() - 60 * 60 * 1000); // One hour before

    if (notificationTime > now) {
        const timeUntilNotification = notificationTime - now;
        setTimeout(() => {
            sendNotification(task);
        }, timeUntilNotification);
    }
}

function sendNotification(task) {
    if (Notification.permission === "granted") {
        new Notification("Upcoming Task", {
            body: `${task.name} is due in one hour! (Due: ${task.dueDate.toLocaleString()})`,
            icon: 'https://example.com/icon.png' // Replace with your icon URL
        });
    }
}

function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
}

function getPriorityBadge(priority) {
    switch (priority) {
        case 'High':
            return 'danger';
        case 'Medium':
            return 'warning';
        case 'Low':
            return 'success';
        default:
            return 'secondary';
    }
}