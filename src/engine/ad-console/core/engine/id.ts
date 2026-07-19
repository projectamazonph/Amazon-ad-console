/**
 * ID generation — single source of truth for all entity IDs.
 */
let _counter = 0;

export function generateId(prefix: string = 'C'): string {
  _counter++;
  return `${prefix}-${Date.now().toString(36)}-${_counter}`;
}

export function resetIdCounter(): void {
  _counter = 0;
}
