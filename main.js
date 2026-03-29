/**
 * Academic Risk Dashboard - Seamless Overlay Edition
 * Consolidated Logic for Auth, Dashboard, and Pandora Tracking
 */

// --- SPA Routing ---
function navigateTo(pageId) {
    if (pageId === 'page-auth') {
        const auth = document.getElementById('page-auth');
        auth.classList.remove('hidden', 'auth-hiding');
        return;
    }
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

// --- Toast Notifications ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-pill';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- Auth Overlay Logic ---
function initAuth() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const successMsg = document.getElementById('reg-success-msg');

    // Tab Switching
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
        formRegister.classList.remove('active');
        successMsg.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.add('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
        formLogin.classList.remove('active');
        successMsg.classList.add('hidden');
    });

    // Login Submit
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        if (!email || !pass) return; 
        
        const user = { name: email.split('@')[0], email, isGuest: false };
        localStorage.setItem('currentUser', JSON.stringify(user));
        startSession(user, true);
    });

    // Register Submit
    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        if (!name || !email) return; 
        
        // Auto-switch to Login on Register success
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = '';
        tabLogin.click();
        successMsg.classList.remove('hidden');
    });

    // Guest Mode
    document.getElementById('btn-guest').addEventListener('click', (e) => {
        e.preventDefault();
        const user = { name: 'Demo Student', email: 'demo@student.com', isGuest: true };
        localStorage.setItem('currentUser', JSON.stringify(user));
        startSession(user, true);
    });

    // Header Triggers
    document.getElementById('nav-login-btn').addEventListener('click', () => {
        navigateTo('page-auth');
    });

    document.getElementById('user-dropdown-btn').addEventListener('click', () => {
        document.getElementById('user-menu').classList.toggle('show-dropdown');
    });

    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('user-menu');
        const userBtn = document.getElementById('user-dropdown-btn');
        const dropdownContent = document.querySelector('.dropdown-content');
        if (userMenu && !userMenu.classList.contains('hidden')) {
            if (!userBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                userMenu.classList.remove('show-dropdown');
            }
        }
    });

    document.getElementById('nav-logout').addEventListener('click', () => {
        document.getElementById('user-menu').classList.remove('show-dropdown');
        localStorage.removeItem('currentUser');
        updateHeaderAuthUI(null);
        navigateTo('page-auth');
    });
    
    document.getElementById('nav-pandora-drop').addEventListener('click', () => {
        document.getElementById('user-menu').classList.remove('show-dropdown');
        navigateTo('page-pandora');
    });
}

function dismissAuthOverlay() {
    const auth = document.getElementById('page-auth');
    if (!auth.classList.contains('hidden')) {
        auth.classList.add('auth-hiding');
        setTimeout(() => {
            auth.classList.add('hidden');
            auth.classList.remove('auth-hiding');
        }, 500); // Wait for @keyframes authFadeOut
    }
}

function updateHeaderAuthUI(user) {
    const loginBtn = document.getElementById('nav-login-btn');
    const userMenu = document.getElementById('user-menu');
    const nameDisplay = document.getElementById('user-greeting-name');

    if (user) {
        loginBtn.classList.add('hidden');
        userMenu.classList.remove('hidden');
        nameDisplay.textContent = user.isGuest ? `${user.name} (Guest)` : user.name;
    } else {
        loginBtn.classList.remove('hidden');
        userMenu.classList.add('hidden');
    }
}

function startSession(user, showNotification = false) {
    updateHeaderAuthUI(user);
    dismissAuthOverlay();
    navigateTo('page-dashboard');
    if (showNotification) {
        showToast(`👋 Welcome back, ${user.name}!`);
    }
}


// --- Logic: Attendance ---
const calculateAttendance = (attended, total) => { return total === 0 ? 0 : Math.round((attended / total) * 100); };
const getAttendanceColor = (percentage) => { return percentage >= 80 ? 'safe' : (percentage >= 75 ? 'warning' : 'danger'); };
const calculateSafeSkips = (attended, total, threshold = 0.75) => { return total === 0 ? 3 : Math.max(0, Math.floor(attended / threshold) - total); };
const calculateRecoveryCount = (attended, total, threshold = 0.75) => { return total === 0 ? 0 : (attended / total >= threshold ? 0 : Math.ceil((threshold * total - attended) / (1 - threshold))); };

// --- Logic: Assignments ---
const getDaysRemaining = (dueDate) => { return Math.ceil((new Date(dueDate) - new Date()) / 86400000); };
const categorizeAssignment = (dueDate) => { const days = getDaysRemaining(dueDate); return days < 0 ? 'overdue' : (days === 0 ? 'today' : (days <= 3 ? 'soon' : 'upcoming')); };
const calculatePressureScore = (assignments) => { return Math.min(100, Math.round(assignments.reduce((sum, task) => { const d = getDaysRemaining(task.dueDate); return sum + ((d < 0 ? 10 : d === 0 ? 8 : d <= 3 ? 5 : 2) * (task.workload / 3)); }, 0) * 2)); };

// --- Logic: Risk & Tips ---
const calculateRiskScore = (attendanceScore, pressureScore) => { return Math.round((attendanceScore * 0.6) + ((100 - pressureScore) * 0.4)); };
const getRiskStatus = (score) => { return score >= 80 ? { label: 'Low Risk', class: 'safe' } : (score >= 60 ? { label: 'Moderate Risk', class: 'warning' } : { label: 'High Risk', class: 'danger' }); };
const getRecommendations = (attendanceScore, pressureScore) => {
    const tips = [];
    if (attendanceScore < 75) tips.push("Prioritize attendance recovery to regain safety threshold."); else if (attendanceScore < 80) tips.push("You're near the warning zone. Try to avoid missing the next class."); else tips.push("Great job on attendance! You have a safe buffer.");
    if (pressureScore > 70) tips.push("High deadline pressure. Resolve overdue tasks immediately."); else if (pressureScore > 40) tips.push("Upcoming deadlines detected. Stay focused."); else tips.push("Academic schedule is stable.");
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

// --- Dashboard Render Logic ---
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
        const insight = (pct >= 75) ? `You can miss ${safeSkips} more classes safely.` : `Attend next ${recovery} classes to regain safety.`;
        item.innerHTML = `
            <div class="subject-info">
                <div class="subject-header-row"><span class="subject-name">${sub.name}</span><button class="btn-skip" data-id="${sub.id}">Skip Next Class</button></div>
                <span class="subject-stats">${sub.attended}/${sub.total} (${pct}%)</span>
            </div>
            <div class="progress-bar-bg"><div class="progress-bar-fill state-${colorClass} attendance-bar-fill" style="--fill-width: ${pct}%"></div></div>
            <div class="insight-text text-${colorClass}">${insight}</div>`;
        list.appendChild(item);
    });
    list.querySelectorAll('.btn-skip').forEach(btn => btn.onclick = () => { const sub = subjects.find(s => s.id === parseInt(btn.dataset.id)); if (sub) { sub.total += 1; updateDashboard(); } });
}

function renderAssignments() {
    const list = document.getElementById('assignment-list');
    list.innerHTML = '';
    [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).forEach(task => {
        const cat = categorizeAssignment(task.dueDate), days = getDaysRemaining(task.dueDate);
        let color = 'safe', label = (days === 0) ? 'Today' : (days < 0 ? 'Overdue' : days + ' days left');
        if (cat === 'overdue' || cat === 'today') color = 'danger'; else if (cat === 'soon') color = 'warning';
        const item = document.createElement('div');
        item.className = `assignment-item border-${color} ${cat === 'overdue' || cat === 'today' ? 'pulse-urgent' : ''}`;
        item.style.borderLeftColor = `var(--${color === 'safe' ? 'success' : color === 'danger' ? 'danger' : 'warning'})`;
        item.innerHTML = `
            <div class="assignment-info"><h3>${task.title}</h3><p class="assignment-meta">${task.subject} • WL: ${task.workload}/5</p></div>
            <div style="text-align: right"><div class="deadline-countdown text-${color}">${label}</div></div>`;
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

    document.getElementById('health-score').textContent = `${rScore}%`;
    const sEl = document.getElementById('risk-status');
    sEl.textContent = status.label;
    sEl.className = `status-msg text-${status.class}`;
    document.getElementById('risk-tips').innerHTML = getRecommendations(avgAtt, pScore).map(t => `<div class="tip-item">${t}</div>`).join('');

    const fill = document.querySelector('.gauge-fill');
    if (fill) {
        fill.style.transform = `rotate(${(rScore / 100) * 180}deg)`;
        fill.style.backgroundColor = `var(--${status.class === 'safe' ? 'success' : status.class === 'danger' ? 'danger' : 'warning'})`;
    }
    if (rScore > 85 && !window.confettiFired) { window.confettiFired = true; fireConfetti(); }
}

function fireConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        confetti.style.backgroundColor = ['#f2d74e', '#95c3de', '#ff9a91', '#4caf50'][Math.floor(Math.random() * 4)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

function updateDashboard() { renderAttendance(); renderAssignments(); renderOverallRisk(); }

// --- Extra Features ---
function initQuotes() {
    const quotes = ["\"The secret of getting ahead is getting started.\" - Mark Twain", "\"You don't have to be great to start, but you have to start to be great.\" - Zig Ziglar"];
    let qIndex = 0; const banner = document.getElementById('quote-banner');
    if (!banner) return;
    banner.textContent = quotes[0]; setTimeout(() => banner.classList.add('fade-in'), 100);
    setInterval(() => {
        banner.classList.remove('fade-in');
        setTimeout(() => { qIndex = (qIndex + 1) % quotes.length; banner.textContent = quotes[qIndex]; banner.classList.add('fade-in'); }, 400);
    }, 8000);
}

function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) { document.body.classList.add('dark-mode'); toggleBtn.textContent = '☀️'; }
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const darkActive = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', darkActive);
        toggleBtn.textContent = darkActive ? '☀️' : '🌙';
        toggleBtn.classList.add('spinning');
        setTimeout(() => toggleBtn.classList.remove('spinning'), 400);
    });
}

function initStreak() {
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('studyStreak') || '0', 10);
    const lastVisit = localStorage.getItem('lastVisitDate');

    if (lastVisit) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (new Date(lastVisit).toDateString() === yesterday.toDateString()) streak++; 
        else if (new Date(lastVisit).toDateString() !== today) streak = 1; 
    } else streak = 1;

    localStorage.setItem('studyStreak', streak); localStorage.setItem('lastVisitDate', today);
    document.getElementById('streak-days').textContent = streak;
    document.getElementById('stat-streak-pandora').textContent = streak;
}

// --- Pandora Timer Logic ---
let pandoraInterval;
let isPandoraRunning = false;
let pandoraMode = 'focus';
let sessionsCompleted = 0;
let dailyGoal = 4;

// Custom durations (loaded from localStorage)
let focusDuration = parseInt(localStorage.getItem('pandoraFocus') || '25', 10);
let breakDuration = parseInt(localStorage.getItem('pandoraBreak') || '5', 10);
let pandoraTime = focusDuration * 60;

function formatTime(seconds) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; }

function getModeDurationSeconds() {
    return pandoraMode === 'focus' ? focusDuration * 60 : breakDuration * 60;
}

function updateDurationDisplays() {
    document.getElementById('focus-duration-display').textContent = focusDuration;
    document.getElementById('break-duration-display').textContent = breakDuration;
}

function setAdjButtonsDisabled(disabled) {
    document.querySelectorAll('.timer-adj-btn').forEach(btn => {
        if (disabled) btn.classList.add('disabled');
        else btn.classList.remove('disabled');
    });
}

function updatePandoraDisplay() {
    document.getElementById('pandora-time-display').textContent = formatTime(pandoraTime);
    document.getElementById('pandora-mode-display').textContent = pandoraMode === 'focus' ? 'Focus Mode' : 'Short Break';
    
    const timerCircle = document.getElementById('pandora-hero-timer');
    if (pandoraMode === 'break') timerCircle.classList.add('break-mode');
    else timerCircle.classList.remove('break-mode');
    
    const totalSeconds = getModeDurationSeconds();
    const perc = totalSeconds > 0 ? (pandoraTime / totalSeconds) * 100 : 100;
    timerCircle.style.setProperty('--timer-pct', `${perc}%`);
    
    document.getElementById('stat-sessions').textContent = sessionsCompleted;
    document.getElementById('stat-focus-time').textContent = sessionsCompleted * focusDuration;
    
    document.getElementById('goal-completed').textContent = sessionsCompleted;
    document.getElementById('goal-total').textContent = dailyGoal;
    document.getElementById('goal-progress-fill').style.width = Math.min((sessionsCompleted / dailyGoal) * 100, 100) + '%';
}

function startPandora() {
    if (isPandoraRunning) return;
    isPandoraRunning = true;
    setAdjButtonsDisabled(true);
    pandoraInterval = setInterval(() => {
        pandoraTime--; updatePandoraDisplay();
        if (pandoraTime <= 0) {
            clearInterval(pandoraInterval); isPandoraRunning = false;
            setAdjButtonsDisabled(false);
            if (pandoraMode === 'focus') {
                sessionsCompleted++;
                document.getElementById('pandora-log').insertAdjacentHTML('afterbegin', `<div class="log-entry">Completed ${focusDuration} min session at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`);
                setPandoraMode('break'); showToast('Focus session complete! Time for a break. ☕');
            } else { setPandoraMode('focus'); showToast('Break over! Ready to focus? 🧠'); }
        }
    }, 1000);
}

function pausePandora() {
    clearInterval(pandoraInterval);
    isPandoraRunning = false;
    setAdjButtonsDisabled(false);
}

function resetPandora() {
    pausePandora();
    pandoraTime = getModeDurationSeconds();
    updatePandoraDisplay();
}

function setPandoraMode(mode) {
    pandoraMode = mode;
    pandoraTime = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
    document.getElementById('mode-focus').classList.toggle('active', mode === 'focus');
    document.getElementById('mode-break').classList.toggle('active', mode === 'break');
    pausePandora(); updatePandoraDisplay();
}

function initPandora() {
    document.getElementById('nav-back-dashboard').addEventListener('click', () => navigateTo('page-dashboard'));
    document.getElementById('pandora-start').addEventListener('click', startPandora);
    document.getElementById('pandora-pause').addEventListener('click', pausePandora);
    document.getElementById('pandora-reset').addEventListener('click', resetPandora);
    document.getElementById('mode-focus').addEventListener('click', () => setPandoraMode('focus'));
    document.getElementById('mode-break').addEventListener('click', () => setPandoraMode('break'));
    document.getElementById('pandora-set-goal').addEventListener('click', () => {
        const val = parseInt(document.getElementById('pandora-goal-input').value, 10);
        if (val > 0) { dailyGoal = val; updatePandoraDisplay(); }
    });

    // Duration adjustment buttons
    document.querySelectorAll('.timer-adj-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPandoraRunning) return;
            const type = btn.dataset.type;
            const action = btn.dataset.action;

            if (type === 'focus') {
                if (action === 'plus' && focusDuration < 90) focusDuration += 5;
                else if (action === 'minus' && focusDuration > 5) focusDuration -= 5;
                localStorage.setItem('pandoraFocus', focusDuration);
            } else if (type === 'break') {
                if (action === 'plus' && breakDuration < 30) breakDuration += 1;
                else if (action === 'minus' && breakDuration > 1) breakDuration -= 1;
                localStorage.setItem('pandoraBreak', breakDuration);
            }

            updateDurationDisplays();
            // If timer is idle, update the main display immediately
            if (!isPandoraRunning) {
                pandoraTime = getModeDurationSeconds();
                updatePandoraDisplay();
            }
        });
    });

    updateDurationDisplays();
    updatePandoraDisplay();
}


// --- AI Study Planner ---
function formatAIResponse(text) {
    return text
        .replace(/## (.*)/g, '<h3 class="ai-section-title">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="ai-list">$1</ul>')
        .replace(/\n{2,}/g, '<br>')
        .trim();
}

function generateFallbackPlan() {
    const healthScore = document.getElementById('health-score')?.textContent || '0%';
    const score = parseInt(healthScore);
    const streak = document.getElementById('streak-days')?.textContent || '0';

    const subjectItems = [];
    document.querySelectorAll('.subject-item').forEach(el => {
        const name = el.querySelector('.subject-name')?.textContent || 'Subject';
        const stats = el.querySelector('.subject-stats')?.textContent || '';
        const insight = el.querySelector('.insight-text')?.textContent || '';
        subjectItems.push({ name, stats, insight });
    });

    const assignmentItems = [];
    document.querySelectorAll('.assignment-item').forEach(el => {
        const title = el.querySelector('h3')?.textContent || 'Assignment';
        const urgency = el.querySelector('.deadline-countdown')?.textContent || '';
        assignmentItems.push({ title, urgency });
    });

    const urgentAssignments = assignmentItems.filter(a =>
        a.urgency.toLowerCase().includes('overdue') || a.urgency.toLowerCase().includes('today')
    );

    return `
        <h3 class="ai-section-title">🚨 Urgent Actions</h3>
        <ul class="ai-list">
          ${urgentAssignments.length > 0
            ? urgentAssignments.map(a => `<li>Complete <strong>${a.title}</strong> — ${a.urgency}</li>`).join('')
            : '<li>No overdue items — great job staying on track!</li>'
          }
        </ul>
        <h3 class="ai-section-title">📚 Today's Priority Order</h3>
        <ul class="ai-list">
          ${subjectItems.slice(0, 4).map((s, i) => `<li>${i + 1}. <strong>${s.name}</strong> — ${s.stats} · ${s.insight}</li>`).join('')}
        </ul>
        <h3 class="ai-section-title">💡 Smart Tips</h3>
        <ul class="ai-list">
          <li>Use Pandora sessions for deep focus — aim for at least 2 sessions today</li>
          <li>${score < 70 ? 'Your health score needs attention — prioritize attendance recovery' : 'Keep maintaining your current academic pace'}</li>
        </ul>
        <h3 class="ai-section-title">💪 You've Got This!</h3>
        <ul class="ai-list">
          <li>${parseInt(streak) > 3 ? `Amazing ${streak}-day streak! Keep the momentum going 🔥` : 'Every expert was once a beginner — start your streak today! 🚀'}</li>
        </ul>
    `;
}

async function generateStudyPlan() {
    const btn = document.getElementById('generate-plan-btn');
    const loading = document.getElementById('ai-loading');
    const result = document.getElementById('ai-result');
    const emptyState = document.getElementById('ai-empty-state');
    const output = document.getElementById('ai-plan-output');

    // Collect data from live DOM
    const healthScore = document.getElementById('health-score')?.textContent || '0%';
    const riskStatus = document.getElementById('risk-status')?.textContent || 'Unknown';
    const streak = document.getElementById('streak-days')?.textContent || '0';

    const subjectTexts = [];
    document.querySelectorAll('.subject-item').forEach(el => {
        const name = el.querySelector('.subject-name')?.textContent || '';
        const stats = el.querySelector('.subject-stats')?.textContent || '';
        const insight = el.querySelector('.insight-text')?.textContent || '';
        subjectTexts.push(`${name}: ${stats} — ${insight}`);
    });

    const assignmentTexts = [];
    document.querySelectorAll('.assignment-item').forEach(el => {
        const title = el.querySelector('h3')?.textContent || '';
        const urgency = el.querySelector('.deadline-countdown')?.textContent || '';
        assignmentTexts.push(`${title} (${urgency})`);
    });

    const prompt = `You are a friendly academic advisor for a college student in India. Generate a concise, actionable study plan based on this data:

Health Score: ${healthScore} | Risk: ${riskStatus} | Study Streak: ${streak} days

Subjects: ${subjectTexts.join(', ')}

Deadlines: ${assignmentTexts.join(', ')}

Respond with exactly these 4 sections, keep each section to 2-3 bullet points max:

## 🚨 Urgent Actions
## 📚 Today's Priority Order
## 💡 Smart Tips
## 💪 You've Got This!

Be specific, friendly, and encouraging. Reference the actual subjects and assignments by name.`;

    // UI state
    btn.disabled = true;
    btn.textContent = '⏳ Generating...';
    emptyState.classList.add('hidden');
    output.classList.remove('hidden');
    loading.classList.remove('hidden');
    result.innerHTML = '';

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': localStorage.getItem('anthropic-api-key') || '',
                'anthropic-dangerous-direct-browser-access': 'true',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const text = data.content?.[0]?.text;
        if (!text) throw new Error('No response text');

        loading.classList.add('hidden');
        result.innerHTML = formatAIResponse(text);

        const timestamp = document.createElement('p');
        timestamp.className = 'ai-timestamp';
        timestamp.textContent = `Generated at ${new Date().toLocaleTimeString()} · Click to regenerate`;
        result.appendChild(timestamp);

        localStorage.setItem('ai-plan', JSON.stringify({ text, generatedAt: new Date().toISOString() }));

    } catch (err) {
        loading.classList.add('hidden');
        // Fallback: generate a rule-based plan if API fails
        result.innerHTML = generateFallbackPlan();
        const note = document.createElement('p');
        note.className = 'ai-timestamp';
        note.textContent = '⚡ Generated offline · Enter API key for AI-powered plan';
        result.appendChild(note);
    } finally {
        btn.disabled = false;
        btn.textContent = '✨ Regenerate Plan';
    }
}

function initAIPlanner() {
    const genBtn = document.getElementById('generate-plan-btn');
    if (!genBtn) return;

    genBtn.addEventListener('click', () => {
        if (!localStorage.getItem('anthropic-api-key')) {
            const key = window.prompt('Enter your Anthropic API key to enable AI Study Planner:');
            if (key && key.trim()) {
                localStorage.setItem('anthropic-api-key', key.trim());
            } else {
                return;
            }
        }
        generateStudyPlan();
    });

    // Restore cached plan if less than 1 hour old
    const cached = localStorage.getItem('ai-plan');
    if (cached) {
        try {
            const { text, generatedAt } = JSON.parse(cached);
            const ageMs = Date.now() - new Date(generatedAt).getTime();
            const ageMinutes = Math.floor(ageMs / 60000);

            if (ageMs < 3600000) {
                document.getElementById('ai-empty-state')?.classList.add('hidden');
                const output = document.getElementById('ai-plan-output');
                output?.classList.remove('hidden');
                const result = document.getElementById('ai-result');
                if (result) result.innerHTML = formatAIResponse(text);

                const ts = document.createElement('p');
                ts.className = 'ai-timestamp';
                ts.textContent = `Generated ${ageMinutes} minute${ageMinutes !== 1 ? 's' : ''} ago · Click to refresh`;
                result?.appendChild(ts);

                if (genBtn) genBtn.textContent = '✨ Regenerate Plan';
            }
        } catch (e) { /* ignore corrupt cache */ }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initQuotes();
    initDarkMode();
    initStreak();
    initPandora();
    initAIPlanner();

    updateDashboard();

    const resetBtn = document.getElementById('reset-simulation');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            subjects = JSON.parse(JSON.stringify(INITIAL_DATA.subjects));
            window.confettiFired = false;
            updateDashboard();
        });
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        startSession(JSON.parse(savedUser), false);
    } else {
        updateHeaderAuthUI(null);
    }
});

