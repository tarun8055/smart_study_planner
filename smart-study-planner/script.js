// ===== SELECTORS =====
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const showTasks = document.getElementById("show-tasks");
const showKanban = document.getElementById("show-kanban");
const showCalendar = document.getElementById("show-calendar");
const showStats = document.getElementById("show-stats");
const darkToggle = document.getElementById("dark-toggle");

const taskSection = document.getElementById("task-section");
const kanbanSection = document.getElementById("kanban-section");
const calendarSection = document.getElementById("calendar-section");
const statsSection = document.getElementById("stats-section");

const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const badgesEl = document.getElementById("badges");

// ===== LOCAL STORAGE =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let gamification = JSON.parse(localStorage.getItem("gamification")) || {
  xp: 0,
  level: 1,
  streak: 0,
  lastLogin: null,
  badges: []
};
let darkMode = localStorage.getItem("darkMode") === "true";

// ===== FUNCTIONS =====
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("gamification", JSON.stringify(gamification));
  localStorage.setItem("darkMode", darkMode);
  renderTasks();
  renderKanban();
  updateProgress();
  updateGamification();
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${task.title} - ${task.deadline} [${task.priority}]</span>
      <div>
        <button class="complete">${task.completed ? "Undo" : "Done"}</button>
        <button class="delete">X</button>
      </div>
    `;

    li.querySelector(".complete").addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      if (tasks[index].completed) addXP(10);
      saveData();
    });

    li.querySelector(".delete").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveData();
    });

    if (task.completed) {
      li.style.textDecoration = "line-through";
      li.style.opacity = "0.6";
    }
    taskList.appendChild(li);
  });
}

function renderKanban() {
  ["todo", "inprogress", "done"].forEach((col) => {
    document.getElementById(col).innerHTML = "";
  });

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "kanban-task fade-in";
    div.draggable = true;
    div.textContent = task.title;
    div.dataset.index = index;

    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("index", index);
    });

    document.getElementById(task.status || "todo").appendChild(div);
  });
}

document.querySelectorAll(".kanban-column").forEach((col) => {
  col.addEventListener("dragover", (e) => e.preventDefault());
  col.addEventListener("drop", (e) => {
    const index = e.dataTransfer.getData("index");
    tasks[index].status = col.dataset.status;
    if (col.dataset.status === "done") addXP(20);
    saveData();
  });
});

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.textContent = `${task.deadline}: ${task.title}`;
    div.classList.add("calendar-task", "fade-in");
    calendar.appendChild(div);
  });
}

function updateProgress() {
  const completed = tasks.filter((t) => t.completed || t.status === "done").length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.textContent = `${percent}% Completed`;
}

// ===== GAMIFICATION =====
function addXP(points) {
  gamification.xp += points;
  if (gamification.xp >= gamification.level * 50) {
    gamification.level++;
    unlockBadge(`Level ${gamification.level}`);
  }
  updateStreak();
  saveData();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (gamification.lastLogin !== today) {
    gamification.streak++;
    gamification.lastLogin = today;
  }
}

function unlockBadge(name) {
  if (!gamification.badges.includes(name)) {
    gamification.badges.push(name);
    alert(`🏆 New Badge Unlocked: ${name}`);
  }
}

function updateGamification() {
  xpEl.textContent = gamification.xp;
  levelEl.textContent = gamification.level;
  streakEl.textContent = gamification.streak;
  badgesEl.innerHTML = "";
  gamification.badges.forEach((b) => {
    const img = document.createElement("img");
    img.src = "assets/badge.png";
    img.alt = b;
    img.title = b;
    badgesEl.appendChild(img);
  });
}

// ===== DARK MODE =====
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  saveData();
}
darkToggle.addEventListener("click", toggleDarkMode);

// ===== EVENT LISTENERS =====
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  const deadline = document.getElementById("task-deadline").value;
  const priority = document.getElementById("task-priority").value;

  tasks.push({ title, deadline, priority, completed: false, status: "todo" });
  addXP(5);
  saveData();
  taskForm.reset();
});

// Navigation
showTasks.addEventListener("click", () => {
  [taskSection, kanbanSection, calendarSection, statsSection].forEach((s) => s.classList.add("hidden"));
  taskSection.classList.remove("hidden");
});
showKanban.addEventListener("click", () => {
  [taskSection, kanbanSection, calendarSection, statsSection].forEach((s) => s.classList.add("hidden"));
  kanbanSection.classList.remove("hidden");
  renderKanban();
});
showCalendar.addEventListener("click", () => {
  [taskSection, kanbanSection, calendarSection, statsSection].forEach((s) => s.classList.add("hidden"));
  calendarSection.classList.remove("hidden");
  renderCalendar();
});
showStats.addEventListener("click", () => {
  [taskSection, kanbanSection, calendarSection, statsSection].forEach((s) => s.classList.add("hidden"));
  statsSection.classList.remove("hidden");
  updateGamification();
});

// ===== INIT =====
if (darkMode) document.body.classList.add("dark");
renderTasks();
renderKanban();
updateProgress();
updateGamification();