/**
 * Academic Risk Dashboard - Consolidated Logic
 * This file contains all logic (Attendance, Assignments, Risk, Storage, UI)
 * merged into one to ensure compatibility when opened via file:// protocol.
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
    if (total === 0) return 0;
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
    if (attendanceScore < 75) tips.push("Prioritize your morning classes this week to recover your attendance buffer.");
    else if (attendanceScore < 80) tips.push("You're near the warning zone. Try to attend at least one more week without skips.");
    else tips.push("Great job on attendance! You have a safe buffer for emergencies.");

    if (pressureScore > 70) tips.push("High deadline pressure. Break your 'Java Project' into smaller 30-min tasks.");
    else if (pressureScore > 40) tips.push("Some deadlines are approaching. Start your TOC Sheet today.");
    else tips.push("Schedule looks clear. Good time to read ahead.");
    return tips;
};

// --- Logic: Storage ---
const STORAGE_KEYS = { SUBJECTS: 'academic_dashboard_subjects', ASSIGNMENTS: 'academic_dashboard_assignments' };
const DEFAULT_DATA = {
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

const StorageService = {
    forceReloadMandatoryData() {
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
        return this.loadSubjects();
    },
    loadSubjects() {
        const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
        if (!stored) { this.saveSubjects(DEFAULT_DATA.subjects); return DEFAULT_DATA.subjects; }
        return JSON.parse(stored);
    },
    saveSubjects(subjects) { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); },
    loadAssignments() {
        const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
        if (!stored) { this.saveAssignments(DEFAULT_DATA.assignments); return DEFAULT_DATA.assignments; }
        return JSON.parse(stored);
    },
    saveAssignments(assignments) { localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); }
};

// --- UI: Modals ---
const ModalUI = {
    container: document.getElementById('modal-container'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    closeBtn: document.getElementById('modal-close'),
    init(onSave) {
        this.closeBtn.onclick = () => this.hide();
        this.container.onclick = (e) => { if (e.target === this.container) this.hide(); };
        this.onSave = onSave;
    },
    show(type, data = null) {
        this.container.classList.remove('hidden');
        this.title.textContent = data ? `Edit ${type}` : `Add ${type}`;
        this.renderForm(type, data);
    },
    hide() { this.container.classList.add('hidden'); },
    renderForm(type, data) {
        if (type === 'Subject') {
            this.body.innerHTML = `<form id="data-form" class="form-grid">
                <div class="form-group"><label>Subject Name</label><input type="text" id="name" required value="${data?.name || ''}"></div>
                <div class="form-row">
                    <div class="form-group"><label>Attended</label><input type="number" id="attended" required min="0" value="${data?.attended || 0}"></div>
                    <div class="form-group"><label>Total Classes</label><input type="number" id="total" required min="1" value="${data?.total || 1}"></div>
                </div>
                <button type="submit" class="btn-primary">Save Subject</button>
            </form>`;
        } else {
            this.body.innerHTML = `<form id="data-form" class="form-grid">
                <div class="form-group"><label>Assignment Title</label><input type="text" id="title" required value="${data?.title || ''}"></div>
                <div class="form-group"><label>Subject Label</label><input type="text" id="subject" required value="${data?.subject || ''}"></div>
                <div class="form-row">
                    <div class="form-group"><label>Due Date</label><input type="date" id="dueDate" required value="${data?.dueDate ? data.dueDate.split('T')[0] : ''}"></div>
                    <div class="form-group"><label>Workload (1-5)</label><input type="number" id="workload" required min="1" max="5" value="${data?.workload || 3}"></div>
                </div>
                <button type="submit" class="btn-primary">Save Assignment</button>
            </form>`;
        }
        document.getElementById('data-form').onsubmit = (e) => {
            e.preventDefault();
            const formData = {};
            e.target.querySelectorAll('input').forEach(input => { formData[input.id] = input.type === 'number' ? parseInt(input.value) : input.value; });
            this.onSave(type, formData, data?.id);
            this.hide();
        };
    }
};

// --- State Management ---
let subjects = StorageService.forceReloadMandatoryData();
let assignments = StorageService.loadAssignments();
let isSimulationMode = false;
const generateId = () => Math.floor(Math.random() * 1000000);

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
        item.className = `subject-item bg-${colorClass} ${isSimulationMode ? 'simulating' : ''}`;
        const insight = (pct >= 75) ? `You can miss ${safeSkips} more classes safely.` : `Attend next ${recovery} classes to regain safety.`;
        item.innerHTML = `
            <div class="subject-info">
                <div><span class="subject-name">${sub.name}</span><button class="btn-delete" data-id="${sub.id}">Delete</button></div>
                <span class="subject-stats">${sub.attended}/${sub.total} (${pct}%)</span>
            </div>
            <div class="progress-bar-bg"><div class="progress-bar-fill state-${colorClass}" style="width: ${pct}%"></div></div>
            <div class="insight-text text-${colorClass}">${insight}</div>`;
        list.appendChild(item);
    });
    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = (e) => {
            subjects = subjects.filter(s => s.id !== parseInt(btn.dataset.id));
            StorageService.saveSubjects(subjects);
            updateDashboard();
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
            <div class="assignment-info"><h3>${task.title}</h3><p class="assignment-meta">${task.subject} • WL: ${task.workload}/5</p></div>
            <div style="text-align: right"><div class="deadline-countdown text-${color}">${label}</div><button class="btn-delete" data-id="${task.id}">Remove</button></div>`;
        list.appendChild(item);
    });
    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = (e) => {
            assignments = assignments.filter(a => a.id !== parseInt(btn.dataset.id));
            StorageService.saveAssignments(assignments);
            updateDashboard();
        };
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

function updateDashboard() { renderAttendance(); renderAssignments(); renderOverallRisk(); }

const handleSave = (type, data, id) => {
    if (type === 'Subject') {
        if (id) subjects = subjects.map(s => s.id === id ? { ...data, id } : s);
        else subjects.push({ ...data, id: generateId() });
        StorageService.saveSubjects(subjects);
    } else {
        if (id) assignments = assignments.map(a => a.id === id ? { ...data, id } : a);
        else assignments.push({ ...data, id: generateId(), dueDate: new Date(data.dueDate).toISOString() });
        StorageService.saveAssignments(assignments);
    }
    updateDashboard();
};

document.addEventListener('DOMContentLoaded', () => {
    ModalUI.init(handleSave);
    updateDashboard();
    document.getElementById('simulate-skip').addEventListener('click', () => {
        isSimulationMode = !isSimulationMode;
        const btn = document.getElementById('simulate-skip');
        if (isSimulationMode) {
            btn.textContent = 'Reset Simulation'; btn.style.background = 'var(--danger)'; btn.style.color = 'white';
            subjects.forEach(s => s.total += 1);
        } else {
            btn.textContent = 'Simulation Mode'; btn.style.background = 'var(--primary-soft)'; btn.style.color = 'var(--primary)';
            subjects.forEach(s => s.total -= 1);
        }
        updateDashboard();
    });
    document.getElementById('add-subject-btn').addEventListener('click', () => ModalUI.show('Subject'));
    document.getElementById('add-assignment-btn').addEventListener('click', () => ModalUI.show('Assignment'));
});
