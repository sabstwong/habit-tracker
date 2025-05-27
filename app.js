const TASKS = [
  "Japanese Practice for 15 min",
  "Spanish Practice for 15 min",
  "Chinese Practice",
  "Drawing Practice",
  "Sketch for 15 min",
  "SQL Practice",
  "Chess Puzzle (1 game)",
  "Coding Practice",
  "Learn Unreal Engine",
  "3D Practice"
];

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  setupTasks();
  loadProgress();

  document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
  document.getElementById('clearBtn')?.addEventListener('click', clearProgress);
});

function getToday() {
  // ✅ Use local date, not UTC
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function setupTasks() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';

  TASKS.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <input type="checkbox" id="${task}" />
      <label for="${task}">${task}</label>
    `;
    container.appendChild(div);
  });
}

function saveProgress() {
  const today = getToday();
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const taskData = {};

  checkboxes.forEach(cb => {
    const task = cb.nextElementSibling.textContent;
    taskData[task] = cb.checked;
  });

  const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
  progressData[today] = taskData;

  localStorage.setItem('progressData', JSON.stringify(progressData));
  alert('✅ Progress saved!');
  loadProgress();
}

function loadProgress() {
  const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
  const today = getToday();
  const todayData = progressData[today] || {};

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    const task = cb.nextElementSibling.textContent;
    cb.checked = todayData[task] || false;
  });

  showHistory(progressData);
}

function clearProgress() {
  if (confirm("Are you sure you want to delete all progress?")) {
    localStorage.removeItem('progressData');
    location.reload();
  }
}

function showHistory(data) {
  const history = document.getElementById('history');
  history.innerHTML = '';

  const labels = [];
  const percentages = [];

  Object.entries(data).forEach(([date, tasks]) => {
    const completed = Object.values(tasks).filter(Boolean).length;
    const percent = Math.round((completed / TASKS.length) * 100);

    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<strong>${date}</strong> – ${completed}/${TASKS.length} tasks completed (${percent}%)`;
    history.appendChild(div);

    labels.push(date);
    percentages.push(percent);
  });

  renderChart(labels, percentages);
}

function renderChart(labels, data) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '% Complete',
        data,
        backgroundColor: 'rgba(75,192,192,0.5)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
