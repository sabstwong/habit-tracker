const TASKS = {
  "Japanese Practice for 15 min": "Learn 10 hiragana or practice phrases.",
  "Spanish Practice for 15 min": "Babbel or Spanish podcast.",
  "Chinese Practice": "Practice tones or flashcards.",
  "Drawing Practice": "Practice perspective or shading.",
  "Sketch for 15 min": "Do a rough drawing.",
  "SQL Practice": "Try a SQL challenge.",
  "Chess Puzzle (1 game)": "Do 5 puzzles or play 1 match.",
  "Coding Practice": "Work on your side project.",
  "Learn Unreal Engine": "Watch a UE tutorial.",
  "3D Practice": "Open Blender and model something."
};

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  setupTasks();
  loadProgress();

  document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
  document.getElementById('clearBtn')?.addEventListener('click', clearProgress);
});

function getToday() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
  return now.toISOString().split('T')[0];
}

function setupTasks() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';
  Object.entries(TASKS).forEach(([task, description]) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <input type="checkbox" id="${task}" />
      <label for="${task}">
        ${task}
        <br><span class="task-desc">${description}</span>
      </label>
    `;
    container.appendChild(div);
  });
}

function saveProgress() {
  const today = getToday();
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const taskData = {};

  checkboxes.forEach(cb => {
    const task = cb.nextElementSibling.childNodes[0].textContent.trim();
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
    const task = cb.nextElementSibling.childNodes[0].textContent.trim();
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
    const completed = Object.entries(tasks).filter(([_, v]) => v).length;
    const percent = Math.round((completed / Object.keys(TASKS).length) * 100);

    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <strong>${date}</strong> – ${completed}/${Object.keys(TASKS).length} tasks completed (${percent}%)
      <ul>
        ${
          Object.entries(tasks)
            .filter(([_, done]) => done)
            .map(([task]) => `<li><strong>${task}</strong><br><em>${TASKS[task]}</em></li>`)
            .join('') || '<li>No tasks completed</li>'
        }
      </ul>
    `;
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
          max: 100,
          title: {
            display: true,
            text: '% of Tasks Completed'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
