export interface ChartInput { originalMs: number | null; deadlineMs: number; proposedMs?: number | null; proposedDeadlineMs?: number | null; experimentComplete: boolean; }
export function chartValues(input: ChartInput): { original:number|null; limit:number|null; simulated:number|null; simulatedLimit:number|null; originalViolation:boolean|null; simulatedViolation:boolean|null; };
