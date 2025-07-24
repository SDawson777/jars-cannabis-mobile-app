export function calculateProgress(current: number, target: number): number {
  return Math.min(current / target, 1);
}
