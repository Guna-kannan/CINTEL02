/**
 * Shared utility for attendance calculations
 */

/**
 * Calculates the attendance percentage based on attended count and total meetings.
 * Formula: (attended / total) * 100, rounded to the nearest whole number.
 * 
 * @param {number} attended - Number of meetings attended
 * @param {number} total - Total number of meetings held
 * @returns {number} Attendance percentage (0-100)
 */
export function calculateAttendancePct(attended, total) {
  if (!total || total <= 0) return 0;
  return Math.round((attended / total) * 100);
}

/**
 * Returns a CSS class for attendance percentage based on value
 * @param {number} pct - Attendance percentage
 * @returns {string} Tailwind color class
 */
export function getAttendanceColor(pct) {
  if (pct >= 90) return "text-emerald-500";
  if (pct >= 75) return "text-amber-500";
  return "text-red-500";
}
