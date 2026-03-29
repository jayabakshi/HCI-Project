/**
 * Academic Risk Dashboard - Consolidated Logic (Professional Edition)
 * Optimized for per-subject simulation and stability.
 */

// --- SPA Routing ---
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// --- Auth Logic ---
function initAuth() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
        formRegister.classList.remove('active');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.add('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
        formLogin.classList.remove('active');
    });

    document.getElementById('btn-login').addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        if (!email || !pass) return alert('Please enter both email and password.');
        
        // Simulate Login
        const user = { name: email.split('@')[0], email };
        localStorage.setItem('currentUser', JSON.stringify(user));
        startSession(user);
    });

    document.getElementById('btn-register').addEventListener('click', () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        if (!name || !email) return alert('Please fill all required fields.');
        
        // Simulate Register
        const user = { name, email };
        localStorage.setItem('currentUser', JSON.stringify(user));
        startSession(user);
    });

    document.getElementById('nav-logout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        navigateTo('page-auth');
    });
}

function startSession(user) {
    document.getElementById('user-greeting').textContent = `👤 ${user.name}`;
    navigateTo('page-dashboard');
    updateDashboard(); // Refresh dash
}


// --- Logic: Attendance ---
const calculateAttendance = (attended, total) => {
    if (total === 0) return 0;
    return Math.round((attended / total) * 100);
};

const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'safe';
    if (percentage >= 75) return 'warning';
    return 'danger';
};

const calculateSafeSkips = (attended, total, threshold = 0.75) => {
    if (total === 0) return 3;
    const maxPossibleTotal = Math.floor(attended / threshold);
    const skips = maxPossibleTotal - total;
    return Math.max(0, skips);
};

const calculateRecoveryCount = (attended, total, threshold = 0.75) => {
    if (total === 0) return 0;
    const currentPct = attended / total;
    if (currentPct >= threshold) return 0;
    const x = (threshold * total - attended) / (1 - threshold);
    return Math.ceil(x);
};

// --- Logic: Assignments ---
const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const categorizeAssignment = (dueDate) => {
    const days = getDaysRemaining(dueDate);
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'upcoming';
};

const calculatePressureScore = (assignments) => {
    if (!assignments.length) return 0;
    let totalScore = 0;
    assignments.forEach(task => {
        const days = getDaysRemaining(task.dueDate);
        let weight = (days < 0) ? 10 : (days === 0) ? 8 : (days <= 3) ? 5 : 2;
        const workload = task.workload || 3;
        totalScore += weight * (workload / 3);
    });
    return Math.min(100, Math.round(totalScore * 2));
};

// --- Logic: Risk ---
const calculateRiskScore = (attendanceScore, pressureScore) => {
    const score = (attendanceScore * 0.6) + ((100 - pressureScore) * 0.4);
    return Math.round(score);
};

const getRiskStatus = (score) => {
    if (score >= 80) return { label: 'Low Risk', class: 'safe' };
    if (score >= 60) return { label: 'Moderate Risk', class: 'warning' };
    return { label: 'High Risk', class: 'danger' };
};

// --- Logic: Tips ---
const getRecommendations = (attendanceScore, pressureScore) => {
    const tips = [];
    if (attendanceScore < 75) tips.push("Prioritize attendance recovery to regain safety threshold.");
    else if (attendanceScore < 80) tips.push("You're near the warning zone. Try to avoid missing the next class.");
    else tips.push("Great job on attendance! You have a safe buffer.");

    if (pressureScore > 70) tips.push("High deadline pressure. Resolve overdue tasks immediately.");
    else if (pressureScore > 40) tips.push("Upcoming deadlines detected. Stay focused.");
    else tips.push("Academic schedule is stable.");
    return tips;
};

// --- Logic: Storage & Data ---
const INITIAL_DATA = {
    subjects: [
        { id: 1, name: 'Computer Networks', attended: 32, total: 40 },
        { id: 2, name: 'Theory of Computation', attended: 27, total: 38 },
        { id: 3, name: 'Data Structures', attended: 36, total: 45 },
        { id: 4, name: 'Java Programming', attended: 22, total: 30 }
    ],
    assignments: [
        { id: 1, title: 'DSA Assignment', subject: 'Data Structures', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), workload: 4 },
        { id: 2, title: 'CN Lab Record', subject: 'Computer Networks', dueDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString(), workload: 3 },
        { id: 3, title: 'TOC Tutorial Sheet', subject: 'Theory of Computation', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), workload: 2 },
        { id: 4, title: 'Java Project Phase 1', subject: 'Java Programming', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), workload: 5 }
    ]
};

let subjects = JSON.parse(JSON.stringify(INITIAL_DATA.subjects));
let assignments = INITIAL_DATA.assignments;

// --- Dashboard Logic ---
function renderAttendance() {
    const list = document.getElementById('attendance-list');
    list.innerHTML = '';

    subjects.forEach(sub => {
        const pct = calculateAttendance(sub.attended, sub.total);
        const colorClass = getAttendanceColor(pct);
        const safeSkips = calculateSafeSkips(sub.attended, sub.total);
        const recovery = calculateRecoveryCount(sub.attended, sub.total);

        const item = document.createElement('div');
        item.className = `subject-item bg-${colorClass}`;

        const insight = (pct >= 75)
            ? `You can miss ${safeSkips} more classes safely.`
            : `Attend next ${recovery} classes to regain safety.`;

        item.innerHTML = `
            <div class="subject-info">
                <div class="subject-header-row">
                    <span class="subject-name">${sub.name}</span>
                    <button class="btn-skip" data-id="${sub.id}">Skip Next Class</button>
                </div>
                <span class="subject-stats">${sub.attended}/${sub.total} (${pct}%)</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill state-${colorClass} attendance-bar-fill" style="--fill-width: ${pct}%"></div>
            </div>
            <div class="insight-text text-${colorClass}">${insight}</div>`;
        list.appendChild(item);
    });

    list.querySelectorAll('.btn-skip').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.dataset.id);
            const sub = subjects.find(s => s.id === id);
            if (sub) {
                sub.total += 1;
                updateDashboard();
            }
        };
    });
}

function renderAssignments() {
    const list = document.getElementById('assignment-list');
    list.innerHTML = '';
    const sorted = [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    sorted.forEach(task => {
        const cat = categorizeAssignment(task.dueDate);
        const days = getDaysRemaining(task.dueDate);
        let color = 'safe';
        let label = (days === 0) ? 'Today' : (days < 0 ? 'Overdue' : days + ' days left');

        if (cat === 'overdue' || cat === 'today') color = 'danger';
        else if (cat === 'soon') color = 'warning';

        const item = document.createElement('div');
        item.className = `assignment-item border-${color}`;
        if (cat === 'overdue' || cat === 'today') item.classList.add('pulse-urgent');
        item.style.borderLeftColor = `var(--${color === 'safe' ? 'success' : color === 'danger' ? 'danger' : 'warning'})`;
        item.innerHTML = `
            <div class="assignment-info">
                <h3>${task.title}</h3>
                <p class="assignment-meta">${task.subject} • WL: ${task.workload}/5</p>
            </div>
            <div style="text-align: right">
                <div class="deadline-countdown text-${color}">${label}</div>
            </div>`;
        list.appendChild(item);
    });

    const pScore = calculatePressureScore(assignments);
    const b = document.getElementById('pressure-badge');
    b.textContent = `Pressure: ${pScore}%`;
    b.className = `badge bg-${pScore > 70 ? 'danger' : pScore > 40 ? 'warning' : 'safe'}`;
}

function renderOverallRisk() {
    const avgAtt = subjects.length > 0 ? subjects.reduce((sum, s) => sum + calculateAttendance(s.attended, s.total), 0) / subjects.length : 100;
    const pScore = calculatePressureScore(assignments);
    const rScore = calculateRiskScore(avgAtt, pScore);
    const status = getRiskStatus(rScore);
    const tips = getRecommendations(avgAtt, pScore);

    document.getElementById('health-score').textContent = `${rScore}%`;
    const sEl = document.getElementById('risk-status');
    sEl.textContent = status.label;
    sEl.className = `status-msg text-${status.class}`;

    document.getElementById('risk-tips').innerHTML = tips.map(t => `<div class="tip-item">${t}</div>`).join('');

    const fill = document.querySelector('.gauge-fill');
    if (fill) {
        fill.style.transform = `rotate(${(rScore / 100) * 180}deg)`;
        fill.style.backgroundColor = `var(--${status.class === 'safe' ? 'success' : status.class === 'danger' ? 'danger' : 'warning'})`;
    }

    if (rScore > 85 && !window.confettiFired) {
        window.confettiFired = true;
        fireConfetti();
    }
}

// Confetti logic
function fireConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        confetti.style.backgroundColor = ['#f2d74e', '#95c3de', '#ff9a91', '#4caf50'][Math.floor(Math.random() * 4)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

function updateDashboard() {
    renderAttendance();
    renderAssignments();
    renderOverallRisk();
}

// --- Extra Features ---
function initQuotes() {
    const quotes = [
        "\"The secret of getting ahead is getting started.\" - Mark Twain",
        "\"You don't have to be great to start, but you have to start to be great.\" - Zig Ziglar",
        "\"Education is the most powerful weapon which you can use to change the world.\" - Nelson Mandela",
        "\"The beautiful thing about learning is that no one can take it away from you.\" - B.B. King"
    ];
    let qIndex = 0;
    const banner = document.getElementById('quote-banner');
    if (!banner) return;
    banner.textContent = quotes[0];
    setTimeout(() => banner.classList.add('fade-in'), 100);

    setInterval(() => {
        banner.classList.remove('fade-in');
        setTimeout(() => {
            qIndex = (qIndex + 1) % quotes.length;
            banner.textContent = quotes[qIndex];
            banner.classList.add('fade-in');
        }, 400); // 0.4s matches the slideInLeft animation
    }, 8000);
}

function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    }
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const darkActive = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', darkActive);
            toggleBtn.textContent = darkActive ? '☀️' : '🌙';
            
            toggleBtn.classList.add('spinning');
            setTimeout(() => toggleBtn.classList.remove('spinning'), 400);
        });
    }
}

function initStreak() {
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('studyStreak') || '0', 10);
    const lastVisit = localStorage.getItem('lastVisitDate');

    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) {
            streak++; 
        } else if (lastDate.toDateString() !== today) {
            streak = 1; 
        }
    } else {
        streak = 1;
    }

    localStorage.setItem('studyStreak', streak);
    localStorage.setItem('lastVisitDate', today);
    const sEl = document.getElementById('streak-days');
    if (sEl) sEl.textContent = streak;
    const pEl = document.getElementById('stat-streak-pandora');
    if (pEl) pEl.textContent = streak;
}


// --- Pandora Timer Logic ---
let pandoraInterval;
let pandoraTime = 25 * 60; // 25 minutes
let isPandoraRunning = false;
let pandoraMode = 'focus'; // 'focus' or 'break'
let sessionsCompleted = 0;
let dailyGoal = 4;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updatePandoraDisplay() {
    document.getElementById('pandora-time-display').textContent = formatTime(pandoraTime);
    const modeEl = document.getElementById('pandora-mode-display');
    modeEl.textContent = pandoraMode === 'focus' ? 'Focus Mode' : 'Short Break';
    
    const timerCircle = document.getElementById('pandora-hero-timer');
    if (pandoraMode === 'break') timerCircle.classList.add('break-mode');
    else timerCircle.classList.remove('break-mode');
    
    // Conic gradient percentage update
    const totalTime = pandoraMode === 'focus' ? 25 * 60 : 5 * 60;
    const perc = (pandoraTime / totalTime) * 100;
    timerCircle.style.setProperty('--timer-pct', `${perc}%`);
    
    // Stats update
    document.getElementById('stat-sessions').textContent = sessionsCompleted;
    document.getElementById('stat-focus-time').textContent = sessionsCompleted * 25;
    
    // Update goal progress
    document.getElementById('goal-completed').textContent = sessionsCompleted;
    document.getElementById('goal-total').textContent = dailyGoal;
    const progress = Math.min((sessionsCompleted / dailyGoal) * 100, 100);
    document.getElementById('goal-progress-fill').style.width = progress + '%';
}

function logSession(durationMinutes) {
    const logList = document.getElementById('pandora-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    entry.textContent = `Completed ${durationMinutes} min session at ${timeString}`;
    logList.prepend(entry);
}

function startPandora() {
    if (isPandoraRunning) return;
    isPandoraRunning = true;
    pandoraInterval = setInterval(() => {
        pandoraTime--;
        updatePandoraDisplay();
        if (pandoraTime <= 0) {
            clearInterval(pandoraInterval);
            isPandoraRunning = false;
            if (pandoraMode === 'focus') {
                sessionsCompleted++;
                logSession(25);
                setPandoraMode('break');
                alert('Focus session complete! Time for a 5-minute break.');
            } else {
                setPandoraMode('focus');
                alert('Break over! Ready to focus again?');
            }
        }
    }, 1000);
}

function pausePandora() {
    clearInterval(pandoraInterval);
    isPandoraRunning = false;
}

function resetPandora() {
    clearInterval(pandoraInterval);
    isPandoraRunning = false;
    pandoraTime = pandoraMode === 'focus' ? 25 * 60 : 5 * 60;
    updatePandoraDisplay();
}

function setPandoraMode(mode) {
    pandoraMode = mode;
    pandoraTime = mode === 'focus' ? 25 * 60 : 5 * 60;
    
    const mFocus = document.getElementById('mode-focus');
    const mBreak = document.getElementById('mode-break');
    
    if (mode === 'focus') {
        mFocus.classList.add('active');
        mBreak.classList.remove('active');
    } else {
        mBreak.classList.add('active');
        mFocus.classList.remove('active');
    }
    
    pausePandora();
    updatePandoraDisplay();
}

function initPandora() {
    // Navigations
    document.getElementById('nav-pandora').addEventListener('click', () => navigateTo('page-pandora'));
    document.getElementById('nav-back-dashboard').addEventListener('click', () => navigateTo('page-dashboard'));

    // Controls
    document.getElementById('pandora-start').addEventListener('click', startPandora);
    document.getElementById('pandora-pause').addEventListener('click', pausePandora);
    document.getElementById('pandora-reset').addEventListener('click', resetPandora);
    
    // Specific mode toggles
    document.getElementById('mode-focus').addEventListener('click', () => setPandoraMode('focus'));
    document.getElementById('mode-break').addEventListener('click', () => setPandoraMode('break'));

    // Goal
    const goalInput = document.getElementById('pandora-goal-input');
    document.getElementById('pandora-set-goal').addEventListener('click', () => {
        const val = parseInt(goalInput.value, 10);
        if (val > 0) {
            dailyGoal = val;
            updatePandoraDisplay();
        }
    });
    
    updatePandoraDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initQuotes();
    initDarkMode();
    initStreak();
    initPandora();

    document.getElementById('reset-simulation').addEventListener('click', () => {
        subjects = JSON.parse(JSON.stringify(INITIAL_DATA.subjects));
        window.confettiFired = false;
        updateDashboard();
    });

    // Check auth cache
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        startSession(JSON.parse(savedUser));
    } else {
        navigateTo('page-auth');
    }
});
