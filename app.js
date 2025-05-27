// ======================
// Supabase Configuration
// ======================
const SUPABASE_URL = 'https://fipvrtzlzddexixbfeyv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHZydHpsemRkZXhpeGJmZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjU1MDcsImV4cCI6MjA2MzgwMTUwN30.Byx_57gkgFrDNz_3fPSUv2quij69YkGmaOw1AzLbo6I'; // Replace with your real anon key
const TABLE_NAME = 'progress_log';

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
  // Fallback or alert user
}

// ======================
// Utility Functions
// ======================
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function generateUserId() {
  try {
    return crypto?.randomUUID?.() || 
           Math.random().toString(36).substring(2) + 
           Date.now().toString(36);
  } catch (err) {
    console.error('ID generation failed:', err);
    return 'user-' + Date.now();
  }
}

const TASK_DESCRIPTIONS = Object.freeze({
  "Japanese Practice for 15 min": "Learn 10 hiragana or practice phrases.",
  "Spanish Practice for 15 min": "Babbel or Spanish podcast.",
  // ... rest of your task descriptions
});

// ======================
// Core Functions
// ======================
async function initializeApp() {
  try {
    // Initialize or get user ID
    let userId = localStorage.getItem("supabase_user_id");
    if (!userId || typeof userId !== "string") {
      userId = generateUserId();
      localStorage.setItem("supabase_user_id", userId);
    }
    
    document.getElementById("userDisplay").textContent = `User ID: ${userId}`;
    console.log("User ID:", userId);

    // Load data
    await Promise.all([
      loadAndShowHistory(userId),
      testSupabaseConnection()
    ]);
    
  } catch (error) {
    console.error("Initialization error:", error);
    alert("Failed to initialize app. Please refresh.");
  }
}

async function saveProgress() {
  if (!supabase) {
    alert("Database connection not available");
    return;
  }

  try {
    const userId = localStorage.getItem("supabase_user_id");
    if (!userId) throw new Error("No user ID found");

    const today = getTodayDate();
    const checkboxes = Array.from(document.querySelectorAll("input[type=checkbox]"));
    
    const todayProgress = checkboxes.reduce((acc, checkbox) => {
      const task = checkbox.parentElement.textContent.trim();
      acc[task] = checkbox.checked;
      return acc;
    }, {});

    console.log("Saving progress:", { userId, today, tasks: todayProgress });

    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        user_id: userId,
        date: today,
        tasks: todayProgress
      }, {
        onConflict: 'user_id,date' // Ensure upsert works
      });

    if (error) throw error;
    
    alert("✅ Progress saved!");
    await loadAndShowHistory(userId);
    
  } catch (error) {
    console.error("Save failed:", error);
    alert(`Failed to save: ${error.message || 'Unknown error'}`);
  }
}

async function loadAndShowHistory(userId) {
  if (!supabase) {
    console.warn("Supabase not initialized");
    return;
  }

  try {
    const { data: rows, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;

    const today = getTodayDate();
    const todayRow = rows.find(row => row.date === today);
    
    // Update checkboxes
    document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
      const task = checkbox.parentElement.textContent.trim();
      checkbox.checked = todayRow?.tasks?.[task] || false;
    });

    showHistory(rows);
    
  } catch (error) {
    console.error("Load error:", error);
    alert("Failed to load history");
  }
}

function showHistory(rows) {
  const historyDiv = document.getElementById("history");
  if (!historyDiv) return;

  historyDiv.innerHTML = "";
  
  const chartData = {
    labels: [],
    percentages: []
  };

  rows.forEach(row => {
    const tasks = row.tasks || {};
    const completedTasks = Object.entries(tasks)
      .filter(([_, done]) => done)
      .map(([name]) => ({
        name,
        description: TASK_DESCRIPTIONS[name.trim()] || "No description"
      }));

    const completionPercent = Math.round(
      (completedTasks.length / Object.keys(tasks).length) * 100
    );

    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <strong>${row.date}</strong> – 
      ${completedTasks.length}/${Object.keys(tasks).length} tasks completed
      (${completionPercent}%)
      <ul>
        ${completedTasks.map(task => `
          <li>
            <strong>${task.name}</strong><br>
            <em>${task.description}</em>
          </li>
        `).join("") || "<li>No tasks completed</li>"}
      </ul>
    `;
    historyDiv.appendChild(historyItem);

    chartData.labels.push(row.date);
    chartData.percentages.push(completionPercent);
  });

  renderChart(chartData.labels, chartData.percentages);
}

// ======================
// Chart Functions
// ======================
let chartInstance = null;

function renderChart(labels, data) {
  const canvas = document.getElementById("progressChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

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
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// ======================
// Event Listeners
// ======================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  
  document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
  document.getElementById('clearBtn')?.addEventListener('click', async () => {
    if (confirm("Are you sure you want to clear all progress?")) {
      await clearProgress();
    }
  });
});

async function clearProgress() {
  try {
    const userId = localStorage.getItem("supabase_user_id");
    if (!userId) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    
    alert("✅ Progress cleared!");
    location.reload();
    
  } catch (error) {
    console.error("Clear error:", error);
    alert("Failed to clear progress");
  }
}

async function testSupabaseConnection() {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .limit(1);

    if (error) throw error;
    
    console.log("✅ Supabase connection successful");
    return true;
    
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
    return false;
  }
}