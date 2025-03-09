// ✅ Google Apps Script API URL (Your Live Web App)
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxdsw0yI-plFRUNQY3KspsaqMhllv3ZSc-Ip1brMRfWfF4bkDiebLg6yRjJ8l23gnAQ/exec";

// ✅ AFL Teams List
const teams = [
    "Adelaide", "Brisbane", "Carlton", "Collingwood", "Essendon",
    "Fremantle", "Geelong", "Gold Coast", "GWS", "Hawthorn",
    "Melbourne", "North Melbourne", "Port Adelaide", "Richmond",
    "St Kilda", "Sydney", "West Coast", "Western Bulldogs"
];

// ✅ Populate Ladder Submission Table
const ladderBody = document.getElementById("ladderBody");
teams.forEach(team => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${team}</td>
        <td><input type="number" name="${team}" min="1" max="18" required></td>
    `;
    ladderBody.appendChild(row);
});

// ✅ Submit Ladder Prediction
async function submitLadder() {
    const playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    const prediction = [];
    document.querySelectorAll("#ladderBody input").forEach(input => {
        prediction.push(parseInt(input.value, 10));
    });

    try {
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, prediction })
        });

        const result = await response.json();
        alert(result.message);
        loadLeaderboard(); // Refresh leaderboard after submission
    } catch (error) {
        console.error("Error submitting ladder:", error);
    }
}

// ✅ Load Leaderboard from Google Sheets
async function loadLeaderboard() {
    try {
        const response = await fetch(GOOGLE_SHEET_API_URL);
        const data = await response.json();

        const tbody = document.getElementById('leaderboard');
        tbody.innerHTML = ''; // Clear old data

        data.forEach((entry, index) => {
            tbody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.prediction.join(", ")}</td>
                <td>${entry.score ? entry.score : "N/A"}</td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

// ✅ Load leaderboard when the page loads
loadLeaderboard();

// ✅ Refresh leaderboard every 60 seconds
setInterval(loadLeaderboard, 60000);