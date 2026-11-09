// Pure validation for animated visual metrics. Never infer missing timings.
const SAFE_MAX = 1_000_000_000;
function valid(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= SAFE_MAX; }
export function chartValues({originalMs, deadlineMs, proposedMs, proposedDeadlineMs, experimentComplete}) {
  const original = valid(originalMs) ? originalMs : null;
  const limit = valid(deadlineMs) && deadlineMs > 0 ? deadlineMs : null;
  const simulated = experimentComplete && valid(proposedMs) ? proposedMs : null;
  const simulatedLimit = experimentComplete && valid(proposedDeadlineMs) && proposedDeadlineMs > 0 ? proposedDeadlineMs : limit;
  return {original,limit,simulated,simulatedLimit,
    originalViolation: original !== null && limit !== null ? original > limit : null,
    simulatedViolation: simulated !== null && simulatedLimit !== null ? simulated > simulatedLimit : null};
}
