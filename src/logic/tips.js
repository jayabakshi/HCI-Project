export const getRecommendations = (attendanceScore, pressureScore) => {
    const tips = [];

    if (attendanceScore < 75) {
        tips.push("Prioritize your morning classes this week to recover your attendance buffer.");
    } else if (attendanceScore < 80) {
        tips.push("You're near the warning zone. Try to attend at least one more week without skips.");
    } else {
        tips.push("Great job on attendance! You have a safe buffer for emergencies.");
    }

    if (pressureScore > 70) {
        tips.push("High deadline pressure detected. Break your 'HCI Prototype' into smaller 30-min tasks.");
    } else if (pressureScore > 40) {
        tips.push("Some deadlines are approaching. Start your draft for 'ML Project' today.");
    } else {
        tips.push("Your schedule looks clear. Good time to read ahead on upcoming topics.");
    }

    return tips;
};
