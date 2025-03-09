// ✅ Google Apps Script API URL (Replace with your actual URL)
const GOOGLE_SHEET_API_URL = "YOUR_GOOGLE_SHEET_SCRIPT_URL_HERE";

// ✅ Squiggle API for Live Ladder & Next Round
const SQUIGGLE_API_LADDER = "https://api.squiggle.com.au/?q=ladder";
const SQUIGGLE_API_FIXTURES = "https://api.squiggle.com.au/?q=games;year=2025;round=NEXT";

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
            </tr>`;
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
    }
}

// ✅ Load Live AFL Ladder from Squiggle API
async function loadLiveLadder() {
    try {
        const response = await fetch(SQUIGGLE_API_LADDER);
        if (!response.ok) throw new Error("Failed to fetch ladder");

        const data = await response.json();
        const tbody = document.getElementById('liveLadder');
        tbody.innerHTML = ''; // Clear previous data

        if (data.ladder && data.ladder.length > 0) {
            data.ladder.forEach(team => {
                tbody.innerHTML += `<tr>
                    <td>${team.rank}</td>
                    <td>${team.name}</td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${team.percentage.toFixed(2)}%</td>
                </tr>`;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='5'>No ladder data available</td></tr>";
        }
    } catch (error) {
        console.error("Error loading live ladder:", error);
    }
}

// ✅ Load Next Round AFL Fixtures from Squiggle API
async function fetchAFLFixtures() {
    try {
        const response = await fetch(SQUIGGLE_API_FIXTURES);
        if (!response.ok) throw new Error("Failed to fetch fixtures");

        const data = await response.json();
        const fixtureList = document.getElementById("fixture-list");
        fixtureList.innerHTML = ''; // Clear previous content

        if (data.games && data.games.length > 0) {
            data.games.forEach(game => {
                fixtureList.innerHTML += `<li><strong>${game.hteam} vs ${game.ateam}</strong> - ${new Date(game.date).toLocaleString()}</li>`;
            });
        } else {
            fixtureList.innerHTML = "No upcoming matches found.";
        }
    } catch (error) {
        console.error("Error fetching AFL fixtures:", error);
        document.getElementById("fixture-list").innerHTML = "Error loading fixtures.";
    }
}

// ✅ Load Everything on Page Load
loadLeaderboard();
loadLiveLadder();
fetchAFLFixtures();

// ✅ Auto-refresh Leaderboard & Ladder every 60 seconds
setInterval(loadLeaderboard, 60000);
setInterval(loadLiveLadder, 60000);
setInterval(fetchAFLFixtures, 60000);