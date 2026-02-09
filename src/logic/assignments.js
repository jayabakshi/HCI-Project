/**
 * Assignment Logic
 */

export const getDaysRemaining = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const categorizeAssignment = (dueDate) => {
    const days = getDaysRemaining(dueDate);
    if (days < 0) return 'overdue';
    if (days === 0) return 'today';
    if (days <= 3) return 'soon';
    return 'upcoming';
};

export const calculatePressureScore = (assignments) => {
    if (!assignments.length) return 0;

    let totalScore = 0;
    assignments.forEach(task => {
        const days = getDaysRemaining(task.dueDate);
        let weight = 0;

        if (days < 0) weight = 10; // Overdue
        else if (days === 0) weight = 8; // Due today
        else if (days <= 3) weight = 5; // Due soon
        else weight = 2; // Upcoming

        // Scale by workload if provided (1-5)
        const workload = task.workload || 3;
        totalScore += weight * (workload / 3);
    });

    // Normalize to 0-100 (roughly)
    return Math.min(100, Math.round(totalScore * 2));
};
