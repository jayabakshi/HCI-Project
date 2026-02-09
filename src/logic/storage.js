/**
 * LocalStorage Service for Persistence
 */

const STORAGE_KEYS = {
    SUBJECTS: 'academic_dashboard_subjects',
    ASSIGNMENTS: 'academic_dashboard_assignments'
};

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

export const StorageService = {
    // Clear and reload to ensure the new mandatory data is shown
    forceReloadMandatoryData() {
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
        return this.loadSubjects(); // This will trigger default load
    },

    loadSubjects() {
        const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
        if (!stored) {
            this.saveSubjects(DEFAULT_DATA.subjects);
            return DEFAULT_DATA.subjects;
        }
        return JSON.parse(stored);
    },

    saveSubjects(subjects) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    },

    loadAssignments() {
        const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
        if (!stored) {
            this.saveAssignments(DEFAULT_DATA.assignments);
            return DEFAULT_DATA.assignments;
        }
        return JSON.parse(stored);
    },

    saveAssignments(assignments) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    }
};
