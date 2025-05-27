// ======================
// Configuration
// ======================
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

// ======================
// Core Functions
// ======================
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function generateUserId() {
  return 'user-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function setupTaskCheckboxes() {
  const container = document.getElementById('tasksContainer');
  Object.entries(TASKS).forEach(([task, description]) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <label>
        <input type="checkbox"> ${task}
      </label>
      <p class="task-description">${description}</p>
    `;
    container.appendChild(div);
  });
}

function getCurrentProgress() {
  const progress = {};
  document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
    const task = checkbox.parentElement.textContent.trim();
    progress[task] = checkbox.checked;
  });
  return progress;
}

function saveToLocalStorage(userId, date, progress) {
  const allData = JSON.parse(localStorage.getItem('progressData') || '{}');
  if (!allData[userId]) allData[userId] = {};
  allData[userId][date] = progress;
  localStorage.setItem('progressData', JSON.stringify(allData));
}

function loadFromLocalStorage(userId) {
  const allData = JSON.parse(localStorage.getItem('progressData') || '{}');
  return allData[userId] || {};
}

function showHistory(history) {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '<h2>Progress History</h2>';
  
  const chartData = {
    labels: [],
    percentages: []
  };

  Object.entries(history).sort().reverse().forEach(([date, tasks]) => {
    const completed = Object.values(tasks).filter(Boolean).length;
    const total = Object.keys(tasks).length;
    const percent = Math.round((completed / total) * 100);

    const entry = document.createElement('div');
    entry.className = 'history-item';
    entry.innerHTML = `
      <h3>${date} - ${percent}% completed</h3>
      <p>${completed}/${total} tasks</p>
      <ul>
        ${Object.entries(tasks)
          .filter(([_, done]) => done)
          .map(([task]) => `<li>${task}</li>`)
          .join('') || '<li>No tasks completed</li>'}
      </ul>
    `;
    historyDiv.appendChild(entry);

    chartData.labels.push(date);
    chartData.percentages.push(percent);
  });

  renderChart(chartData.labels, chartData.percentages);
}

function renderChart(labels, data) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '% Completed',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// ======================
// Event Handlers
// ======================
async function saveProgress() {
  const userId = localStorage.getItem('userId');
  const today = getTodayDate();
  const progress = getCurrentProgress();
  
  saveToLocalStorage(userId, today, progress);
  alert('Progress saved locally!');
  loadAndShowHistory();
}

function clearProgress() {
  if (confirm('Clear ALL progress data?')) {
    localStorage.removeItem('progressData');
    localStorage.removeItem('userId');
    location.reload();
  }
}

function loadAndShowHistory() {
  const userId = localStorage.getItem('userId');
  const history = loadFromLocalStorage(userId);
  showHistory(history);
  
  // Update today's checkboxes
  const today = getTodayDate();
  const todayTasks = history[today] || {};
  document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
    const task = checkbox.parentElement.textContent.trim();
    checkbox.checked = todayTasks[task] || false;
  });
}

// ======================
// Initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
  // Setup user ID
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('userId', userId);
  }
  document.getElementById('userDisplay').textContent = `User ID: ${userId}`;

  // Setup UI
  setupTaskCheckboxes();
  loadAndShowHistory();

  // Event listeners
  document.getElementById('saveBtn').addEventListener('click', saveProgress);
  document.getElementById('clearBtn').addEventListener('click', clearProgress);
});