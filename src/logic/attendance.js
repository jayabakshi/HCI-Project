/**
 * Attendance Logic
 */

export const calculateAttendance = (attended, total) => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
};

export const getAttendanceColor = (percentage) => {
  if (percentage >= 80) return 'safe';
  if (percentage >= 75) return 'warning';
  return 'danger';
};

/**
 * Formula: (Attended / (Total + Future Missed)) >= 0.75
 * Re-arranged: (Attended / 0.75) - Total >= Future Missed
 */
export const calculateSafeSkips = (attended, total, threshold = 0.75) => {
  if (total === 0) return 0;
  const maxPossibleTotal = Math.floor(attended / threshold);
  const skips = maxPossibleTotal - total;
  return Math.max(0, skips);
};

/**
 * Formula: ((Attended + x) / (Total + x)) >= 0.75
 * Re-arranged: x >= (0.75 * Total - Attended) / (1 - 0.75)
 */
export const calculateRecoveryCount = (attended, total, threshold = 0.75) => {
  const currentPct = attended / total;
  if (currentPct >= threshold) return 0;
  
  const x = (threshold * total - attended) / (1 - threshold);
  return Math.ceil(x);
};
