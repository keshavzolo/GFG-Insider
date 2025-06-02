document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("submit-btn");
    const userInput = document.getElementById("user-input");
    const errorMsg = document.getElementById("error-message");

    // Progress elements
    const basicPercent = document.getElementById("basic-percent");
    const easyPercent = document.getElementById("easy-percent");
    const mediumPercent = document.getElementById("medium-percent");
    const hardPercent = document.getElementById("hard-percent");
    
    const basicCircle = document.getElementById("basic-circle");
    const easyCircle = document.getElementById("easy-circle");
    const mediumCircle = document.getElementById("medium-circle");
    const hardCircle = document.getElementById("hard-circle");

    const TOTAL = {
        basic: 770,
        easy: 1356,
        medium: 1132,
        hard: 210
    };

    function showError(message) {
        errorMsg.textContent = message;
    }

    function validateInput(username) {
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        if (!username.trim()) {
            showError("Please enter a username.");
            return false;
        }
        if (!regex.test(username.trim())) {
            showError("Invalid username format (1-15 alphanumeric characters).");
            return false;
        }
        showError("");
        return true;
    }

    function updateCircle(element, percent) {
        element.textContent = `${percent}%`;
        
        // Update circle color based on percentage
        element.parentElement.classList.remove("low", "medium", "high");
        
        if (percent < 30) {
            element.parentElement.classList.add("low");
        } else if (percent < 70) {
            element.parentElement.classList.add("medium");
        } else {
            element.parentElement.classList.add("high");
        }
    }

    function displayUserData(data) {
        const stats = data.solvedStats || {};
        
        const basicCount = stats.basic?.count || 0;
        const easyCount = stats.easy?.count || 0;
        const mediumCount = stats.medium?.count || 0;
        const hardCount = stats.hard?.count || 0;

        updateCircle(basicPercent, Math.round((basicCount / TOTAL.basic) * 100));
        updateCircle(easyPercent, Math.round((easyCount / TOTAL.easy) * 100));
        updateCircle(mediumPercent, Math.round((mediumCount / TOTAL.medium) * 100));
        updateCircle(hardPercent, Math.round((hardCount / TOTAL.hard) * 100));
    }

    async function fetchUserData(username) {
        const url = `http://localhost:3000/api/${encodeURIComponent(username)}`;
        
        try {
            // Show loading state
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            searchButton.disabled = true;
            showError("");

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(response.status === 404 ? "User not found." : "Failed to fetch data.");
            }

            const data = await response.json();
            
            if (!data?.solvedStats) {
                throw new Error("No stats found for this user.");
            }

            displayUserData(data);
        } catch (error) {
            showError(error.message);
            resetProgress();
        } finally {
            searchButton.innerHTML = '<i class="fas fa-search"></i> Search';
            searchButton.disabled = false;
        }
    }

    function resetProgress() {
        [basicPercent, easyPercent, mediumPercent, hardPercent].forEach(el => {
            el.textContent = "0%";
            el.parentElement.classList.remove("low", "medium", "high");
        });
    }

    // Event listeners
    searchButton.addEventListener("click", () => {
        const username = userInput.value.trim();
        if (validateInput(username)) {
            fetchUserData(username);
        }
    });

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchButton.click();
        }
    });

    // Initialize
    resetProgress();
});