export const calculateRiskScore = (attendanceScore, pressureScore) => {
    // attendanceScore: 100 is perfect, 0 is worst
    // pressureScore: 0 is no pressure, 100 is extreme pressure

    // Formula: Higher score means HEALTHIER (Low Risk)
    const score = (attendanceScore * 0.6) + ((100 - pressureScore) * 0.4);
    return Math.round(score);
};

export const getRiskStatus = (score) => {
    if (score >= 80) return { label: 'Low Risk – You’re on track.', class: 'safe' };
    if (score >= 60) return { label: 'Moderate Risk – Attention needed.', class: 'warning' };
    return { label: 'High Risk – Immediate action required.', class: 'danger' };
};
