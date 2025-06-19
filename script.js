const target = document.getElementById("target");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const scoreboard = document.getElementById("scoreboard");
const clickCountSpan = document.getElementById("clickCount");
const avgTimeSpan = document.getElementById("avgTime");
const minTimeSpan = document.getElementById("minTime");
const maxTimeSpan = document.getElementById("maxTime");
const timerDiv = document.getElementById("timer");
const timerSpan = document.getElementById("timerSpan");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const menu = document.getElementById("menu");
const scoreHud = document.getElementById("scoreHud");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPage = document.getElementById("settingsPage");
const backBtn = document.getElementById("backBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const circleSizeInput = document.getElementById("circleSizeInput");
const circleColorInput = document.getElementById("circleColorInput");
const circlePreview = document.getElementById("circlePreview");

darkModeToggle.onchange = () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("theme-nord");
        localStorage.setItem("theme", "nord");
    } else {
        document.body.classList.remove("theme-nord");
        localStorage.setItem("theme", "light");
    }
};

circleSizeInput.oninput = () => {
    updateCirclePreview();
};

circleColorInput.oninput = () => {
    circleColor = circleColorInput.value;
    applyCircleColor();
};

let prevTimestamp = null;
let times = [];
let clickCount = 0;
let timer = 0;
let timerInterval = null;
let startTime = null;
let isRunning = false;
let circleSize = 60;
let circleColor = "#84cc16";

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function adjustColor(col, factor) {
    const r = Math.min(255, Math.max(0, Math.round(parseInt(col.slice(1, 3), 16) * factor)));
    const g = Math.min(255, Math.max(0, Math.round(parseInt(col.slice(3, 5), 16) * factor)));
    const b = Math.min(255, Math.max(0, Math.round(parseInt(col.slice(5, 7), 16) * factor)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function applyCircleSize() {
    target.style.width = circleSize + "px";
    target.style.height = circleSize + "px";
    document.documentElement.style.setProperty("--circle-size", circleSize + "px");
}

function applyCircleColor() {
    const border = adjustColor(circleColor, 1.1);
    document.documentElement.style.setProperty("--custom-target-color", circleColor);
    document.documentElement.style.setProperty("--custom-target-border", border);
    const rgb = hexToRgb(circleColor);
    document.documentElement.style.setProperty(
        "--pulse-rgb",
        `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    );
    circlePreview.style.background = circleColor;
    circlePreview.style.borderColor = border;
}

function updateCirclePreview() {
    circlePreview.style.width = circleSizeInput.value + "px";
    circlePreview.style.height = circleSizeInput.value + "px";
}

// safe margin from all borders
const margin = 70; // should be > radius+border

function randomPos() {
    const targetSize = circleSize + 4 * 2; // circle + border
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minX = margin;
    const minY = margin;
    const maxX = w - margin - targetSize;
    const maxY = h - margin - targetSize;
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
}

function updateStats(timeDelta) {
    clickCount++;
    clickCountSpan.textContent = clickCount;
    if (timeDelta !== null) {
        times.push(timeDelta);
        let avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        avgTimeSpan.textContent = avg;
        minTimeSpan.textContent = Math.min(...times);
        maxTimeSpan.textContent = Math.max(...times);
    }
}

target.addEventListener("click", () => {
    if (!isRunning) return;
    const now = Date.now();
    let timeDelta = prevTimestamp ? now - prevTimestamp : null;
    prevTimestamp = now;
    updateStats(timeDelta);
    randomPos();
});

startBtn.onclick = () => {
    menu.style.display = "none";
    stopBtn.style.display = "";
    scoreHud.style.display = "";
    clickCount = 0;
    times = [];
    prevTimestamp = null;
    clickCountSpan.textContent = "0";
    avgTimeSpan.textContent = "0";
    minTimeSpan.textContent = "-";
    maxTimeSpan.textContent = "-";
    target.style.display = "";
    applyCircleSize();
    randomPos();
    isRunning = true;
    timer = 0;
    startTime = Date.now();
    timerSpan.textContent = "0.00";
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer = (Date.now() - startTime) / 1000;
        timerSpan.textContent = timer.toFixed(2);
    }, 20);
};

function stopGame() {
    isRunning = false;
    menu.style.display = "";
    stopBtn.style.display = "none";
    scoreHud.style.display = "none";
    target.style.display = "none";
    if (timerInterval) clearInterval(timerInterval);

    if (times.length > 0) {
        saveHistory();
        loadHistory();
    }
    clickCount = 0;
    times = [];
    prevTimestamp = null;
    timer = 0;
    timerSpan.textContent = "0.00";
}

stopBtn.onclick = stopGame;

function saveHistory() {
    let record = {
        date: new Date().toLocaleString(),
        clicks: clickCount,
        avg: times.length
            ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
            : 0,
        min: times.length ? Math.min(...times) : "-",
        max: times.length ? Math.max(...times) : "-",
        duration: timerSpan.textContent,
    };
    let history = JSON.parse(
        localStorage.getItem("mouseless_aim_history") || "[]",
    );
    history.unshift(record);
    history = history.slice(0, 30);
    localStorage.setItem("mouseless_aim_history", JSON.stringify(history));
}

function loadHistory() {
    let history = JSON.parse(
        localStorage.getItem("mouseless_aim_history") || "[]",
    );
    historyList.innerHTML = "";
    if (history.length === 0) {
        historyList.innerHTML = '<li style="color:#b6a171;">(No records yet)</li>';
        return;
    }
    history.forEach((rec) => {
        let li = document.createElement("li");
        li.innerHTML = `<b>${rec.date}</b>
      | Clicks: <span>${rec.clicks}</span>
      | Avg: <span>${rec.avg}</span> ms
      | Fastest: <span>${rec.min}</span> ms
      | Slowest: <span>${rec.max}</span> ms
      | Time: <span>${rec.duration}</span>s
    `;
        historyList.appendChild(li);
    });
}
clearHistoryBtn.onclick = () => {
    localStorage.removeItem("mouseless_aim_history");
    loadHistory();
};

settingsBtn.onclick = () => {
    menu.style.display = "none";
    settingsPage.style.display = "";
    loadSettings();
};

backBtn.onclick = () => {
    settingsPage.style.display = "none";
    menu.style.display = "";
};

function loadSettings() {
    const theme = localStorage.getItem("theme");
    if (theme === "nord") {
        document.body.classList.add("theme-nord");
        darkModeToggle.checked = true;
    } else {
        document.body.classList.remove("theme-nord");
        darkModeToggle.checked = false;
    }
    circleSize = parseInt(localStorage.getItem("circleSize") || "60");
    circleSizeInput.value = circleSize;
    circleColor = localStorage.getItem("circleColor") || circleColor;
    circleColorInput.value = circleColor;
    applyCircleSize();
    applyCircleColor();
    updateCirclePreview();
}

saveSettingsBtn.onclick = () => {
    circleSize = parseInt(circleSizeInput.value) || 60;
    localStorage.setItem("circleSize", circleSize);
    circleColor = circleColorInput.value || circleColor;
    localStorage.setItem("circleColor", circleColor);
    applyCircleSize();
    applyCircleColor();
    backBtn.click();
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (settingsPage.style.display !== "none") {
            backBtn.click();
        } else if (isRunning) {
            stopGame();
        }
    }
});

window.onload = () => {
    loadHistory();
    loadSettings();
};

// Optional: keyboard trigger for target
document.addEventListener("keydown", (e) => {
    if (
        target.style.display !== "none" &&
        isRunning &&
        (e.key === "Enter" || e.key === " ")
    ) {
        const rect = target.getBoundingClientRect();
        const mx = window.event?.clientX || 0,
            my = window.event?.clientY || 0;
        if (
            mx >= rect.left &&
            mx <= rect.right &&
            my >= rect.top &&
            my <= rect.bottom
        ) {
            target.click();
        }
    }
});
