/**
 * Academic Risk Dashboard - Consolidated Logic (Professional Edition)
 * Optimized for per-subject simulation and stability.
 */

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
    if (total === 0) return 3; // Default buffer for new subjects
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
const STORAGE_KEYS = { SUBJECTS: 'academic_dashboard_subjects', ASSIGNMENTS: 'academic_dashboard_assignments' };
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

// --- Initial Load Logic ---
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
                <div class="progress-bar-fill state-${colorClass}" style="width: ${pct}%"></div>
            </div>
            <div class="insight-text text-${colorClass}">${insight}</div>`;
        list.appendChild(item);
    });

    // Wire up skip buttons
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
}

function updateDashboard() {
    renderAttendance();
    renderAssignments();
    renderOverallRisk();
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();

    document.getElementById('reset-simulation').addEventListener('click', () => {
        subjects = JSON.parse(JSON.stringify(INITIAL_DATA.subjects));
        updateDashboard();
    });
});
