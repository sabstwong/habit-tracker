// ✅ 1. Get local date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ 2. Task descriptions
const taskDescriptions = {
  "Japanese Practice for 15 min": "Learn 10 hiragana or practice phrases using Duolingo or flashcards.",
  "Spanish Practice for 15 min": "Review vocabulary, listen to a Spanish song, or do a Babbel session.",
  "Chinese Practice": "Practice tones and basic characters using HelloChinese.",
  "Drawing Practice": "Work on fundamentals like line control, shading, or perspective.",
  "Sketch for 15 min": "Do quick sketches from reference or imagination.",
  "SQL Practice": "Work on Mode SQL tutorials or write a query from a dataset.",
  "Chess Puzzle (1 game)": "Complete 5 puzzles or play a 10-minute game on Lichess.",
  "Coding Practice": "Work on Python, JavaScript, or small practice projects.",
  "Learn Unreal Engine": "Watch a tutorial and follow along building something in UE5.",
  "3D Practice": "Model something simple in Blender (like a mug or donut).",
  "Language Review (JP/ES/CN)": "Review flashcards or repeat key phrases in all 3 languages.",
  "Sketch + Drawing Session": "Spend 30–45 min on a detailed sketch or full drawing.",
  "Coding or Unreal (1 hr)": "Focus deeply on one coding or game dev topic for an hour.",
  "Passive Language Practice": "Watch anime, listen to a podcast, or read subtitles.",
  "3D Practice or Painting": "Try a creative 3D or digital painting session.",
  "SQL or Portfolio Project": "Work on SQL queries or update your project site."
};

// ✅ 3. Save progress by task name
function saveProgress() {
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  const today = getTodayDate();

  let allProgress = JSON.parse(localStorage.getItem("progressLog") || "{}");
  let todayProgress = {};

  checkboxes.forEach((cb) => {
    const task = cb.parentElement.textContent.trim();
    todayProgress[task] = cb.checked;
  });

  allProgress[today] = todayProgress;
  localStorage.setItem("progressLog", JSON.stringify(allProgress));

  alert("Progress saved for " + today + "!");
}

// ✅ 4. Load saved progress on page load
window.onload = () => {
  const today = getTodayDate();

  const allProgress = JSON.parse(localStorage.getItem("progressLog") || "{}");
  const saved = allProgress[today] || {};

  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((cb) => {
    const task = cb.parentElement.textContent.trim();
    cb.checked = saved[task] || false;
  });

  showHistory(allProgress);
};

// ✅ 5. Show history with descriptions + percentages
function showHistory(allProgress) {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  const labels = [];
  const percentages = [];

  for (const [date, tasks] of Object.entries(allProgress)) {
    const completedTasks = Object.entries(tasks)
      .filter(([_, done]) => done)
      .map(([name]) => {
        const desc = taskDescriptions[name.trim()] || "(No description available)";
        return `<li><strong>${name}</strong><br><em>${desc}</em></li>`;
      });

    const total = Object.keys(tasks).length;
    const completeCount = completedTasks.length;
    const percent = Math.round((completeCount / total) * 100);

    const historyBlock = document.createElement("div");
    historyBlock.innerHTML = `
      <strong>${date}</strong> – ${completeCount}/${total} tasks completed (${percent}%)
      <ul>${completedTasks.join("") || "<li>No tasks completed</li>"}</ul>
    `;
    historyBlock.style.marginBottom = "16px";

    historyDiv.appendChild(historyBlock);

    labels.push(date);
    percentages.push(percent);
  }

  renderChart(labels, percentages);
}

// ✅ 6. Chart.js bar chart
let chartInstance;

function renderChart(labels, data) {
  const ctx = document.getElementById('progressChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '% of Tasks Completed',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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
            text: '% Complete'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}


// ✅ 7. Clear button
function clearProgress() {
  localStorage.removeItem("progressLog");
  alert("All saved progress has been cleared!");
  location.reload(); // Refresh the page
}
