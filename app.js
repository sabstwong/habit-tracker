// ======================
// Supabase Configuration (COMMENTED OUT FOR NOW)
// ======================
// Replace 'YOUR_SUPABASE_KEY' with your actual Supabase 'anon public' key.
// This key is safe to expose in client-side code.
const SUPABASE_URL = 'https://fipvrtzlzddexixbfeyv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHZydHpsemRkZXhpeGJmZXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMjU1MDcsImV4cCI6MjA2MzgwMTUwN30.Byx_57gkgFrDNz_3fPSUv2quij69YkGmaOw1AzLbo6I'; // <--- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL KEY
const TABLE_NAME = 'progress_log'; // Name of your Supabase table for progress tracking

// let supabase; // Declare the Supabase client globally, but initialize it later.
// Temporarily set supabase to null, as we're commenting out initialization
let supabase = null;

// ======================
// Task Definitions (Consolidated and Frozen for safety)
// ======================
// This object defines all the tasks available in the tracker, along with their descriptions.
// Object.freeze makes the object immutable, preventing accidental modifications during runtime.
const TASKS = Object.freeze({
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
});

// ======================
// Utility Functions
// ======================
/**
 * Gets the current date in YYYY-MM-DD format.
 * @returns {string} The current date as a string.
 */
function getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

// ======================
// UI Setup & Authentication Handling (MODIFIED)
// ======================
let chartInstance = null; // Variable to hold the Chart.js instance, allowing it to be destroyed and recreated.

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

/**
 * Handles changes in the Supabase authentication state (e.g., user logs in, logs out).
 * It updates the UI visibility (auth form vs. app content) and loads user-specific data.
 * @param {object|null} user - The Supabase user object if logged in, or null if logged out.
 * (This function is now largely irrelevant as auth is commented out, but kept for structure)
 */
async function handleAuthChange(user) {
    // These elements are now always displayed or not needed with auth commented out in HTML
    // const authContainer = document.getElementById('auth-container');
    // const appContent = document.getElementById('app-content');
    const userDisplay = document.getElementById('userDisplay');
    // const logoutBtn = document.getElementById('logoutBtn');
    const authMessage = document.getElementById('authMessage');

    if (authMessage) authMessage.textContent = ''; // Clear any messages

    // Since auth is disabled, we'll simulate a "user" to load data for demonstration
    // IMPORTANT: For a real app, this userId MUST come from an authenticated session.
    // For now, this is a placeholder to allow save/load functionality to run.
    const demoUserId = 'anonymous_app_user_for_testing';

    // The app content is always shown, and userDisplay will just show a default message
    if (userDisplay) userDisplay.textContent = `Welcome, Guest! (Authentication disabled)`;

    // Load data for the demo user
    await loadAndShowHistory(demoUserId);
}

// ======================
// Supabase Authentication Functions (COMMENTED OUT)
// ======================
/*
async function signUp() {
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authMessage = document.getElementById('authMessage');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
        if (authMessage) authMessage.textContent = 'Email and password are required for signup.';
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (authMessage) authMessage.textContent = 'Please check your email to confirm your account!';
        console.log('Signed up:', data);
    } catch (error) {
        console.error('Signup error:', error.message);
        if (authMessage) authMessage.textContent = `Signup failed: ${error.message}`;
    }
}

async function signIn() {
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authMessage = document.getElementById('authMessage');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
        if (authMessage) authMessage.textContent = 'Email and password are required for login.';
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('Logged in:', data.user);
    } catch (error) {
        console.error('Login error:', error.message);
        if (authMessage) authMessage.textContent = `Login failed: ${error.message}`;
    }
}

async function signOut() {
    const authMessage = document.getElementById('authMessage');
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Logged out');
        if (authMessage) authMessage.textContent = 'Successfully logged out.';
    } catch (error) {
        console.error('Logout error:', error.message);
        if (authMessage) authMessage.textContent = `Logout failed: ${error.message}`;
    }
}
*/

// ======================
// Core App Functions (Data Management - MODIFIED FOR NO AUTH)
// ======================

/**
 * Saves the current state of the checkboxes to the Supabase database.
 * Requires an authenticated user.
 * MODIFIED: Uses a hardcoded userId for testing without authentication.
 * THIS IS INSECURE FOR A PRODUCTION APP WITHOUT AUTHENTICATION.
 */
async function saveProgress() {
    // If Supabase is intentionally set to null (auth disabled)
    if (!supabase) {
        alert("Supabase is currently disabled. Progress cannot be saved.");
        console.warn("Attempted to save progress, but Supabase client is null.");
        return;
    }

    // IMPORTANT: In a real app, userId would come from supabase.auth.getUser().
    // For testing without auth, we use a fixed ID.
    const userId = 'anonymous_app_user_for_testing'; // Hardcoded for testing without authentication
    const today = getTodayDate(); // Get today's date in YYYY-MM-DD format

    // Collect the state of all task checkboxes
    const tasks = {};
    document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
        const taskName = checkbox.parentElement.textContent.trim(); // Get task name from label
        tasks[taskName] = checkbox.checked; // Store true/false for checked state
    });

    console.log("Saving progress:", { userId, today, tasks: tasks });

    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert({
                user_id: userId,
                date: today,
                tasks: tasks // The JSON object of task states
            }, {
                onConflict: 'user_id,date'
            });

        if (error) throw error; // Propagate any Supabase errors

        alert("✅ Progress saved successfully!");
        await loadAndShowHistory(userId); // Reload history to reflect the saved changes

    } catch (error) {
        console.error("Save failed:", error);
        alert(`Failed to save progress. Error: ${error.message || 'Unknown error'}.
                Please check your internet connection or Supabase setup (e.g., RLS policies).`);
    }
}

/**
 * Loads the progress history for the given user ID from Supabase and updates the UI.
 * MODIFIED: Uses a hardcoded userId for testing without authentication.
 * THIS IS INSECURE FOR A PRODUCTION APP WITHOUT AUTHENTICATION.
 * @param {string} userId - The ID of the user whose history to load (now a placeholder).
 */
async function loadAndShowHistory(userId) {
    if (!supabase) {
        console.warn("Supabase client not initialized, cannot load history.");
        const historyDiv = document.getElementById("history");
        if (historyDiv) {
            historyDiv.innerHTML = '<h2>Your History</h2><p>Database not connected (authentication disabled).</p>';
        }
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        return;
    }

    // Ensure a valid userId is provided (now hardcoded for testing)
    if (!userId) {
        console.warn("No user ID provided for loading history. Aborting.");
        return;
    }

    try {
        const { data: rows, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq('user_id', userId) // Filter by the hardcoded user's ID
            .order('date', { ascending: true }); // Order chronologically for chart display

        if (error) throw error; // Propagate any Supabase errors

        const today = getTodayDate();
        // Find today's progress entry to update the current checkboxes
        const todayData = rows.find(item => item.date === today);

        // Update the checkboxes on the current day's task list
        document.querySelectorAll('#tasksContainer input[type="checkbox"]').forEach(checkbox => {
            const taskName = checkbox.parentElement.textContent.trim();
            // Use optional chaining (?.) to safely access properties that might be undefined
            checkbox.checked = todayData?.tasks?.[taskName] || false;
        });

        showHistory(rows); // Render the fetched history and update the chart

    } catch (error) {
        console.error("Load history failed:", error);
        alert(`Failed to load history. Error: ${error.message || 'Unknown error'}.
                Please ensure your RLS policies allow 'select' for the 'anonymous_app_user_for_testing' user or remove RLS for now.`);
    }
}

/**
 * Renders the historical progress data in the 'history' div and updates the Chart.js graph.
 * @param {Array<object>} rows - An array of progress log entries.
 */
function showHistory(rows) {
    const historyDiv = document.getElementById("history");
    if (!historyDiv) {
        console.error("history element not found!");
        return;
    }

    // Clear previous history content
    historyDiv.innerHTML = '<h2>Your History</h2>';

    const chartData = {
        labels: [],     // Dates for the chart's X-axis
        percentages: [] // Completion percentages for the chart's Y-axis
    };

    // If no history data is available, display a message and clear the chart
    if (!rows || rows.length === 0) {
        historyDiv.innerHTML += '<p>No history found. Start tracking your progress!</p>';
        if (chartInstance) {
            chartInstance.destroy(); // Destroy existing chart if no data
            chartInstance = null;
        }
        return;
    }

    // Ensure history is sorted by date in ascending order for correct chart display
    // (This sort is already done in loadAndShowHistory, but keeping it here for robustness)
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));

    rows.forEach(row => {
        const tasksInEntry = row.tasks || {}; // Get tasks for the current entry, default to empty object
        const totalTasksDefined = Object.keys(TASKS).length; // Get the total number of tasks defined in the app
        const completedInEntry = Object.values(tasksInEntry).filter(Boolean).length; // Count completed tasks

        // Calculate completion percentage. Handle division by zero if no tasks are defined.
        const completionPercent = totalTasksDefined > 0 ?
                                  Math.round((completedInEntry / totalTasksDefined) * 100) : 0;

        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        historyItem.innerHTML = `
            <strong>${row.date}</strong> –
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

        chartData.labels.push(row.date);
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
 * Confirms with the user and then clears all their progress data from Supabase.
 * Requires an authenticated user.
 * MODIFIED: Uses a hardcoded userId for testing without authentication.
 * THIS IS INSECURE FOR A PRODUCTION APP WITHOUT AUTHENTICATION.
 */
async function clearProgress() {
    if (!supabase) {
        alert("Supabase is currently disabled. Data cannot be cleared.");
        console.warn("Attempted to clear data, but Supabase client is null.");
        return;
    }

    // IMPORTANT: In a real app, userId would come from supabase.auth.getUser().
    // For testing without auth, we use a fixed ID.
    const userId = 'anonymous_app_user_for_testing'; // Hardcoded for testing without authentication

    // Use a custom modal or confirmation dialog instead of window.confirm in production
    if (!confirm("Are you sure you want to delete ALL your progress data for this anonymous session? This cannot be undone.")) {
        return; // User cancelled the operation
    }

    try {
        // Delete all records for the specific (hardcoded) user from the table
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("user_id", userId); // Critical: only delete data for the current hardcoded user

        if (error) throw error; // Propagate any Supabase errors

        alert("✅ All your progress data has been cleared!");
        // After clearing, reload history for the current user, which will now be empty.
        await loadAndShowHistory(userId);

    } catch (error) {
        console.error("Clear progress failed:", error);
        alert(`Failed to clear progress: ${error.message || 'Unknown error'}.
                Please ensure your RLS policies allow 'delete' for the 'anonymous_app_user_for_testing' user or remove RLS for now.`);
    }
}

/**
 * Tests the Supabase connection by attempting a minimal query.
 * Provides feedback on connection status and potential RLS issues.
 * @returns {Promise<boolean>} True if connection seems successful, false otherwise.
 * (COMMENTED OUT as Supabase client is now commented out)
 */
/*
async function testSupabaseConnection() {
    if (!supabase) {
        console.warn("Supabase client not initialized for connection test.");
        return false;
    }

    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("id")
            .limit(1);

        if (error) {
            if (error.code === '42501') {
                console.warn("Supabase connection: RLS might be blocking access, but connection seems OK.");
                console.warn("Please ensure your RLS policies for 'progress_log' table allow 'select' for anonymous/authenticated users as needed for testing.");
                return true;
            }
            throw error;
        }

        console.log("✅ Supabase connection successful.");
        return true;

    } catch (error) {
        console.error("❌ Supabase connection failed:", error);
        alert(`Supabase connection test failed: ${error.message || 'Unknown error'}.
                Check your console and Supabase API key/URL.`);
        return false;
    }
}
*/

// ======================
// Main Initialization and Event Listeners (MODIFIED)
// ======================
// This runs when the entire HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup the task checkboxes once when the app loads
    setupTaskCheckboxes();

    // --- IMPORTANT: Supabase client initialization (COMMENTED OUT) ---
    /*
    try {
        if (typeof Supabase !== 'undefined' && Supabase.createClient) {
            supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase client initialized successfully.');
        } else {
            console.error('Supabase library not loaded or "Supabase" object is undefined.');
            alert('Error: Supabase library not loaded. Please check your internet connection and console for details.');
            return; // Stop execution if Supabase isn't ready
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error.message);
        alert('Error initializing Supabase client: ' + error.message);
        return;
    }
    */
    // --- END Supabase client initialization ---

    // 2. We are no longer listening for auth state changes or getting initial sessions.
    // Instead, directly call handleAuthChange to initialize the app for a "guest" user.
    // This will load data based on the hardcoded 'anonymous_app_user_for_testing' ID.
    await handleAuthChange(null); // Pass null as there's no real user object

    // Commented out authentication-related listeners
    /*
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session);
        await handleAuthChange(session?.user || null); // Pass the user object or null
    });

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting initial session:", error.message);
        const authMessage = document.getElementById('authMessage');
        if (authMessage) authMessage.textContent = `Error checking session: ${error.message}`;
    }
    await handleAuthChange(session?.user || null);
    */

    // Commented out connection test
    // await testSupabaseConnection();

    // 3. Attach event listeners to the buttons (signup, login, logout are removed in HTML)
    document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
    document.getElementById('clearBtn')?.addEventListener('click', clearProgress);

    // Commented out auth button listeners
    /*
    document.getElementById('signupBtn')?.addEventListener('click', signUp);
    document.getElementById('loginBtn')?.addEventListener('click', signIn);
    document.getElementById('logoutBtn')?.addEventListener('click', signOut);
    */
});