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

// ======================
// Fixed Date Functions (MODIFIED TO FIX TO MAY 26, 2025)
// ======================
/**
 * Gets a fixed date for testing purposes (May 26, 2025).
 * @returns {string} The fixed date as a string (e.g., "2025-05-26").
 */
function getTodayDate() {
    // Return a fixed date string for May 26, 2025
    return "2025-05-26";
}

/**
 * Formats a date string into a more readable format (e.g., "May 26, 2025").
 * @param {string} dateStr - The date string in YYYY-MM-DD format.
 * @returns {string} The formatted date string.
 */
function formatDisplayDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Pass the date string directly to Date constructor
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// ======================
// Local Storage Functions (CRUCIAL FOR OFFLINE SAVE/LOAD)
// (These were missing from your snippet, but are essential for localStorage)
// ======================
/**
 * Loads the entire progress history for a given user ID from localStorage.
 * @param {string} userId - The ID of the user.
 * @returns {object} The loaded history object, or an empty object if not found.
 */
function loadFromLocalStorage(userId) {
    if (!userId) return {}; // Handle case where userId is not set (shouldn't happen with fixed ID)
    const storedData = localStorage.getItem(`progress_${userId}`);
    return storedData ? JSON.parse(storedData) : {};
}

/**
 * Saves a specific day's progress for a user to localStorage.
 * @param {string} userId - The ID of the user.
 * @param {string} date - The date of the progress.
 * @param {object} tasksData - The object containing task completion status for the date.
 */
function saveToLocalStorage(userId, date, tasksData) {
    if (!userId) {
        console.error("Cannot save to localStorage: userId is missing.");
        return;
    }
    const history = loadFromLocalStorage(userId); // Load existing history
    history[date] = tasksData; // Update/add the specific date's tasks
    localStorage.setItem(`progress_${userId}`, JSON.stringify(history));
    console.log(`Saved progress for ${date} for user ${userId} to localStorage.`);
}


// ======================
// UI Setup
// ======================
/**
 * Dynamically creates checkbox elements for each task defined in the TASKS constant.
 * These checkboxes are displayed in the 'tasksContainer' div in the HTML.
 */
async function setupTaskCheckboxes() {
    const container = document.getElementById('tasksContainer');
    if (!container) {
        console.error("tasksContainer element not found! Cannot set up checkboxes.");
        return;
    }
    container.innerHTML = ''; // Clear any existing tasks before adding new ones
    Object.entries(TASKS).forEach(([taskName, description]) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <label>
                <input type="checkbox"> ${taskName}
            </label>
            <p class="task-description">${description}</p>
        `;
        container.appendChild(div);
    });
}

// ======================
// Core App Functions (Data Management - MODIFIED for localStorage)
// ======================
let chartInstance = null; // Variable to hold the Chart.js instance

/**
 * Saves the current state of the checkboxes to localStorage.
 */
async function saveProgress() {
    // IMPORTANT: For local storage, use a fixed ID for simplicity
    const userId = 'local_storage_test_user';
    const today = getTodayDate(); // This will now return "2025-05-26"

    // Collect the state of all task checkboxes
    const tasks = {};
    document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
        const taskName = checkbox.parentElement.textContent.trim(); // Get task name from label
        tasks[taskName] = checkbox.checked; // Store true/false for checked state
    });

    console.log("Saving progress to localStorage:", { userId, today, tasks: tasks });

    saveToLocalStorage(userId, today, tasks); // Use the new localStorage save function
    alert("✅ Progress saved successfully to local storage!");
    await loadAndShowHistory(); // Reload history to reflect the saved changes
}

/**
 * Loads the progress history for the fixed user ID from localStorage and updates the UI.
 */
function loadAndShowHistory() {
    // IMPORTANT: For local storage, use a fixed ID for simplicity
    const userId = 'local_storage_test_user';

    const history = loadFromLocalStorage(userId); // Use the new localStorage load function

    const today = getTodayDate(); // This will now return "2025-05-26"

    // Ensure today's entry exists in history, initializing if not
    if (!history[today]) {
        history[today] = Object.keys(TASKS).reduce((acc, task) => {
            acc[task] = false; // All tasks unchecked by default for a new day
            return acc;
        }, {});
        // Save this initialized empty state for today to localStorage immediately
        saveToLocalStorage(userId, today, history[today]);
    }

    // Update today's checkboxes based on the loaded (or newly initialized) state
    document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
        const taskName = checkbox.parentElement.textContent.trim();
        checkbox.checked = history[today][taskName] || false;
    });

    showHistory(history); // Render the fetched history and update the chart
}

/**
 * Renders the historical progress data in the 'history' div and updates the Chart.js graph.
 * @param {object} history - An object containing progress log entries keyed by date.
 */
function showHistory(history) {
    const historyDiv = document.getElementById("history");
    if (!historyDiv) {
        console.error("history element not found!");
        return;
    }

    // Clear previous history content
    historyDiv.innerHTML = '<h2>📊 Progress History</h2>';

    const chartData = {
        labels: [],     // Dates for the chart's X-axis
        percentages: [] // Completion percentages for the chart's Y-axis
    };

    // Sort dates in ascending order for correct chart display (oldest first)
    const sortedDates = Object.keys(history).sort((a, b) => new Date(a) - new Date(b));

    // If no history data is available after sorting, display a message and clear the chart
    if (!sortedDates || sortedDates.length === 0) {
        historyDiv.innerHTML += '<p>No history found. Start tracking your progress!</p>';
        if (chartInstance) {
            chartInstance.destroy(); // Destroy existing chart if no data
            chartInstance = null;
        }
        return;
    }

    sortedDates.forEach(date => {
        const tasksInEntry = history[date] || {}; // Get tasks for the current entry, default to empty object
        const totalTasksDefined = Object.keys(TASKS).length; // Get the total number of tasks defined in the app
        const completedInEntry = Object.values(tasksInEntry).filter(Boolean).length; // Count completed tasks

        // Calculate completion percentage. Handle division by zero if no tasks are defined.
        const completionPercent = totalTasksDefined > 0 ?
                                  Math.round((completedInEntry / totalTasksDefined) * 100) : 0;

        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        historyItem.innerHTML = `
            <strong>${formatDisplayDate(date)}</strong> –
            ${completedInEntry}/${totalTasksDefined} tasks completed
            (${completionPercent}%)
            <ul>
                ${Object.entries(tasksInEntry)
                    .filter(([_, done]) => done) // Filter for tasks marked as true (completed)
                    .map(([name]) => `
                        <li>
                            <strong>${name}</strong><br>
                            <em>${TASKS[name] || "No description available"}</em>
                        </li>
                    `).join("") || "<li>No tasks completed</li>"}
            </ul>
        `;
        historyDiv.appendChild(historyItem);

        chartData.labels.push(formatDisplayDate(date)); // Use formatted date for display
        chartData.percentages.push(completionPercent);
    });

    renderChart(chartData.labels, chartData.percentages); // Update the chart with new data
}

// ======================
// Chart Functions
// ======================
/**
 * Renders or updates the bar chart displaying progress percentages over time.
 * @param {Array<string>} labels - Dates for the chart's X-axis.
 * @param {Array<number>} data - Completion percentages for the chart's Y-axis.
 */
function renderChart(labels, data) {
    const canvas = document.getElementById("progressChart");
    if (!canvas) {
        console.error("progressChart canvas element not found!");
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("Could not get 2D rendering context for canvas!");
        return;
    }

    // Destroy any existing chart instance before creating a new one to prevent memory leaks and conflicts.
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    chartInstance = new Chart(ctx, {
        type: "bar", // Bar chart type
        data: {
            labels: labels, // Dates
            datasets: [{
                label: "% of Tasks Completed", // Label for the dataset
                data: data, // Percentages
                backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
                borderColor: "rgba(75, 192, 192, 1)", // Bar border color
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, // Chart will resize with its container
            scales: {
                y: {
                    beginAtZero: true, // Y-axis starts at 0
                    max: 100,           // Y-axis goes up to 100%
                    title: {
                        display: true,
                        text: "% Complete" // Y-axis label
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date' // X-axis label
                    }
                }
            },
            plugins: {
                legend: { display: false } // Hide the dataset legend as it's self-explanatory
            }
        }
    });
}

/**
 * Confirms with the user and then clears all their progress data from localStorage.
 */
async function clearProgress() {
    // IMPORTANT: For local storage, use a fixed ID for simplicity
    const userId = 'local_storage_test_user';

    if (!confirm("Are you sure you want to delete ALL your progress data for this anonymous session? This cannot be undone.")) {
        return; // User cancelled the operation
    }

    localStorage.removeItem(`progress_${userId}`);
    alert("✅ All your progress data has been cleared from local storage!");
    // After clearing, reload history, which will now be empty.
    await loadAndShowHistory();
}

// ======================
// Main Initialization and Event Listeners
// ======================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup the task checkboxes once when the app loads
    setupTaskCheckboxes();

    // 2. Initialize the app for a "guest" user by loading data from localStorage
    await loadAndShowHistory();

    // 3. Attach event listeners to the buttons
    document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
    document.getElementById('clearBtn')?.addEventListener('click', clearProgress);
});