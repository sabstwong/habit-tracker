// ✅ 1. Supabase client setup
const supabaseUrl = 'https://fipvrtzlzddexixbfeyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHZydHpsemRkZXhpeGJmZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjU1MDcsImV4cCI6MjA2MzgwMTUwN30.Byx_57gkgFrDNz_3fPSUv2quij69YkGmaOw1AzLbo6I';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ✅ 2. Then set up user ID
let userId = localStorage.getItem("supabase_user_id");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("supabase_user_id", userId);
}

// ✅ Debug line
console.log("User ID:", userId);
document.getElementById("userDisplay").textContent = "User ID: " + userId;



// ✅ 2. Get local date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ 3. Task descriptions
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

// ✅ 4. Save progress to Supabase
async function saveProgress() {
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  const today = getTodayDate();

  const todayProgress = {};
  checkboxes.forEach((cb) => {
    const task = cb.parentElement.textContent.trim();
    todayProgress[task] = cb.checked;
  });

  const { error } = await supabase
    .from("progress_log")
    .upsert({
      user_id: userId,
      date: today,
      tasks: todayProgress
    });

  if (error) {
    alert("❌ Error saving progress.");
    console.error(error);
  } else {
    alert("✅ Progress saved to Supabase!");
    loadAndShowHistory();
  }
}

// ✅ 5. Load progress from Supabase
window.onload = async () => {
  await loadAndShowHistory();
};

async function loadAndShowHistory() {
  const today = getTodayDate();
  const { data: rows, error } = await supabase
    .from("progress_log")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error loading history:", error);
    return;
  }

  const todayRow = rows.find(row => row.date === today);
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((cb) => {
    const task = cb.parentElement.textContent.trim();
    cb.checked = todayRow?.tasks?.[task] || false;
  });

  const allProgress = {};
  rows.forEach((row) => {
    allProgress[row.date] = row.tasks;
  });
  showHistory(allProgress);
}

// ✅ 6. Display progress history
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

// ✅ 7. Render chart
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

// ✅ 8. Clear cloud data
async function clearProgress() {
  const { error } = await supabase
    .from("progress_log")
    .delete()
    .eq("user_id", userId);

  if (error) {
    alert("❌ Error clearing cloud progress.");
    console.error(error);
  } else {
    alert("✅ All progress cleared from Supabase!");
    location.reload();
  }
}
