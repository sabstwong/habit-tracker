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
// Date Functions (Eastern Time)
// ======================
function getTodayDate() {
  const now = new Date();
  const easternTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  const [month, day, year] = easternTime.split('/');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York'
  });
}

// ======================
// Local Storage Functions
// ======================
function loadFromLocalStorage(userId) {
  const storedData = localStorage.getItem(`progress_${userId}`);
  return storedData ? JSON.parse(storedData) : {};
}

function saveToLocalStorage(userId, date, tasksData) {
  const history = loadFromLocalStorage(userId);
  history[date] = tasksData;
  localStorage.setItem(`progress_${userId}`, JSON.stringify(history));
  console.log(`Saved progress for ${date}`);
}

// ======================
// UI Setup
// ======================
function setupTaskCheckboxes() {
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';
  Object.keys(TASKS).forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `
      <label>
        <input type="checkbox" />
        ${task}
      </label>
    `;
    container.appendChild(div);
  });
}

// ======================
// Save / Load
// ======================
async function saveProgress() {
  const userId = 'local_storage_test_user';
  const today = getTodayDate();

  const tasks = {};
  document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(cb => {
    const taskName = cb.parentElement.textContent.trim();
    tasks[taskName] = cb.checked;
  });

  saveToLocalStorage(userId, today, tasks);
  alert("✅ Progress saved!");
  loadAndShowHistory();
}

function loadAndShowHistory() {
  const userId = 'local_storage_test_user';
  const today = getTodayDate();
  const history = loadFromLocalStorage(userId);

  if (!history[today]) {
    history[today] = Object.keys(TASKS).reduce((acc, task) => {
      acc[task] = false;
      return acc;
    }, {});
    saveToLocalStorage(userId, today, history[today]);
  }

  document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(cb => {
    const task = cb.parentElement.textContent.trim();
    cb.checked = history[today][task] || false;
  });

  showHistory(history);
}

// ======================
// History + Chart
// ======================
function showHistory(history) {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = '<h2>📊 Progress History</h2>';

  const chartData = {
    labels: [],
    percentages: []
  };

  const sortedDates = Object.keys(history).sort((a, b) => new Date(a) - new Date(b));

  if (sortedDates.length === 0) {
    historyDiv.innerHTML += '<p>No history yet.</p>';
    if (chartInstance) chartInstance.destroy();
    return;
  }

  sortedDates.forEach(date => {
    const tasks = history[date];
    const total = Object.keys(TASKS).length;
    const completed = Object.values(tasks).filter(Boolean).length;
    const percent = Math.round((completed / total) * 100);

    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <strong>${formatDisplayDate(date)}</strong> – ${completed}/${total} tasks completed (${percent}%)
      <ul>
        ${
          Object.entries(tasks)
            .filter(([_, done]) => done)
            .map(([name]) => `<li><strong>${name}</strong><br><em>${TASKS[name]}</em></li>`)
            .join("") || "<li>No tasks completed</li>"
        }
      </ul>
    `;
    historyDiv.appendChild(div);

    chartData.labels.push(formatDisplayDate(date));
    chartData.percentages.push(percent);
  });

  renderChart(chartData.labels, chartData.percentages);
}

function renderChart(labels, data) {
  const ctx = document.getElementById("progressChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "% of Tasks Completed",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
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
            text: "% Complete"
          }
        },
        x: {
          title: {
            display: true,
            text: "Date"
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// ======================
// Clear Data
// ======================
async function clearProgress() {
  const userId = 'local_storage_test_user';
  if (confirm("Delete all progress? This cannot be undone.")) {
    localStorage.removeItem(`progress_${userId}`);
    alert("✅ Data cleared.");
    loadAndShowHistory();
  }
}

// ======================
// Init
// ======================
document.addEventListener('DOMContentLoaded', () => {
  setupTaskCheckboxes();
  loadAndShowHistory();
  document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
  document.getElementById('clearBtn')?.addEventListener('click', clearProgress);
});
