/**
 * Responsive breakpoints & mobile menu state machine.
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
export type MenuStatus = 'closed' | 'open' | 'closing';

export interface MobileMenuState {
  status: MenuStatus;
}

export type MobileMenuAction =
  | { type: 'INIT' }
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ANIMATION_END' };

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1100;

export function resolveBreakpoint(width: number): Breakpoint {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width <= TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
}

export function mobileMenuReducer(
  state?: MobileMenuState,
  action?: MobileMenuAction,
): MobileMenuState {
  if (!state || action?.type === 'INIT') return { status: 'closed' };
  switch (action?.type) {
    case 'TOGGLE':
      if (state.status === 'closed') return { status: 'open' };
      if (state.status === 'open') return { status: 'closing' };
      return state;
    case 'OPEN':
      return { status: 'open' };
    case 'CLOSE':
      return { status: 'closing' };
    case 'ANIMATION_END':
      if (state.status === 'closing') return { status: 'closed' };
      return state;
    default:
      return state;
  }
}

export function isTouchViewport(hasTouch: boolean, width: number): boolean {
  return hasTouch && width <= TABLET_BREAKPOINT;
}
