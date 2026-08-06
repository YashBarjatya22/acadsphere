/**
 * Attendance Margin Calculator
 * Computes how many hours a student can skip (SAFE) or
 * must attend consecutively (CRITICAL) for both 75% and 85% targets.
 *
 * Formula for SAFE (P >= target):
 *   leavesAllowed = floor((attended / R) - total)
 *
 * Formula for CRITICAL (P < target):
 *   classesNeeded = ceil((R * total - attended) / (1 - R))
 *
 * where R is the target ratio (0.85 or 0.75).
 */

export interface TargetMargin {
  status: "SAFE" | "CRITICAL";
  /** Hours student can still skip and stay at/above target (SAFE only) */
  leavesAllowed?: number;
  /** Consecutive hours student must attend to reach target (CRITICAL only) */
  classesNeeded?: number;
}

export interface MarginResult {
  /** Raw percentage (0-100), unrounded */
  currentPct: number;
  target85: TargetMargin;
  target75: TargetMargin;
}

/**
 * Core margin computation for a single target ratio R.
 * Handles edge case: total === 0 → always SAFE, 0 leaves.
 */
function computeTarget(attended: number, total: number, R: number): TargetMargin {
  if (total === 0) {
    return { status: "SAFE", leavesAllowed: 0 };
  }
  const P = (attended / total) * 100;
  if (P >= R * 100) {
    // SAFE — how many more can we skip?
    const leavesAllowed = Math.max(0, Math.floor((attended / R) - total));
    return { status: "SAFE", leavesAllowed };
  } else {
    // CRITICAL — how many consecutive must we attend?
    const classesNeeded = Math.max(0, Math.ceil((R * total - attended) / (1 - R)));
    return { status: "CRITICAL", classesNeeded };
  }
}

/**
 * Calculates attendance margins for both 85% and 75% targets.
 *
 * @param attended  Number of hours/classes attended
 * @param total     Total hours/classes conducted
 */
export function calculateAttendanceMargins(
  attended: number,
  total: number
): MarginResult {
  const currentPct = total > 0 ? (attended / total) * 100 : 100;
  return {
    currentPct,
    target85: computeTarget(attended, total, 0.85),
    target75: computeTarget(attended, total, 0.75),
  };
}

/**
 * Returns a short human-readable label for the margin, e.g.:
 *   "Can skip 3 hrs"  OR  "Attend 5 hrs"
 */
export function marginLabel(margin: TargetMargin, unit = "hr"): string {
  if (margin.status === "SAFE") {
    const n = margin.leavesAllowed ?? 0;
    return `Can skip ${n} ${unit}${n !== 1 ? "s" : ""}`;
  } else {
    const n = margin.classesNeeded ?? 0;
    return `Attend ${n} ${unit}${n !== 1 ? "s" : ""}`;
  }
}

/**
 * Color for each target status in a card context.
 */
export function marginColor(
  margin: TargetMargin,
  target: 85 | 75
): { text: string; bg: string; border: string } {
  if (margin.status === "SAFE") {
    return target === 85
      ? { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
      : { text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  }
  return target === 85
    ? { text: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
    : { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
}
