// ======================
// Configuration
// ======================
const TASKS = {
  "Japanese Practice for 15 min": "Learn 10 hiragana or practice phrases.",
  // ... (keep your other tasks)
};

// ======================
// Fixed Date Functions
// ======================
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// ======================
// Core Functions (Updated)
// ======================
function loadAndShowHistory() {
  const userId = localStorage.getItem('userId');
  const history = loadFromLocalStorage(userId);
  
  // Ensure today's date exists in history
  const today = getTodayDate();
  if (!history[today]) {
    history[today] = Object.keys(TASKS).reduce((acc, task) => {
      acc[task] = false;
      return acc;
    }, {});
    saveToLocalStorage(userId, today, history[today]);
  }

  showHistory(history);
  
  // Update today's checkboxes
  document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
    const task = checkbox.parentElement.textContent.trim();
    checkbox.checked = history[today][task] || false;
  });
}

function showHistory(history) {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '<h2>Progress History</h2>';
  
  const chartData = {
    labels: [],
    percentages: []
  };

  // Sort dates in descending order
  const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));

  sortedDates.forEach(date => {
    const tasks = history[date];
    const completed = Object.values(tasks).filter(Boolean).length;
    const total = Object.keys(tasks).length;
    const percent = Math.round((completed / total) * 100);

    const entry = document.createElement('div');
    entry.className = 'history-item';
    entry.innerHTML = `
      <h3>${formatDisplayDate(date)} - ${percent}% completed</h3>
      <p>${completed}/${total} tasks</p>
      <ul>
        ${Object.entries(tasks)
          .filter(([_, done]) => done)
          .map(([task]) => `<li>${task}</li>`)
          .join('') || '<li>No tasks completed</li>'}
      </ul>
    `;
    historyDiv.appendChild(entry);

    chartData.labels.push(formatDisplayDate(date));
    chartData.percentages.push(percent);
  });

  renderChart(chartData.labels, chartData.percentages);
}

// ======================
// Initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with today's date
  console.log("Today's date:", getTodayDate());
  
  // Rest of your initialization code...
  setupTaskCheckboxes();
  loadAndShowHistory();
});