# Mobile Redesign Plan - Amazon Ad Console

## Executive Summary

This document outlines the comprehensive mobile redesign for the Amazon Ad Console training simulator. The goal is to transform the current desktop-focused interface into a fully mobile-optimized experience while maintaining feature parity and training effectiveness.

---

## Current State Analysis

### What Works
- ✅ Mobile hamburger menu with slide-out drawer
- ✅ Responsive breakpoints (mobile < 768px, tablet 768-1100px, desktop > 1100px)
- ✅ Touch-friendly button sizes (min 44px)
- ✅ Horizontal scroll for tabs
- ✅ Hidden sidebar on mobile

### Critical Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Tables don't adapt to mobile | Critical | Campaign list unusable on phones |
| No touch gestures | High | Missed mobile-native patterns |
| Poor table readability | High | Tiny text, requires horizontal scroll |
| Dashboard cards stack poorly | Medium | Suboptimal use of screen space |
| Campaign detail tabs overflow | Medium | 8 tabs on single line |
| Action buttons too small | Medium | Quick actions need better touch targets |
| No bottom sheet for actions | Low | Should use native-feeling bottom sheets |
| Missing safe area handling | Low | Notch/home indicator areas not accounted for |

---

## Design Principles

1. **Mobile-First Philosophy**: Design for the smallest screen first, then enhance for larger screens
2. **Touch-Optimized**: All interactive elements must be easily tappable (min 44px touch targets)
3. **Context-Aware**: Show relevant information based on screen size and user context
4. **Performance-Conscious**: Minimize re-renders and optimize for mobile browsers
5. **Training-Focused**: Ensure mobile experience doesn't compromise training effectiveness

---

## Technical Architecture

### Breakpoint System
```css
/* Current breakpoints */
@media (max-width: 768px) { /* Mobile */ }
@media (min-width: 769px) and (max-width: 1100px) { /* Tablet */ }
@media (min-width: 1101px) { /* Desktop */ }
```

### Component Structure
- **MobileNav**: Slide-out drawer for navigation (existing)
- **BottomNav**: Bottom navigation bar for mobile (new)
- **CampaignCard**: Card-based campaign display (new)
- **BottomSheet**: Reusable bottom sheet component (new)
- **SwipeableActions**: Swipe gesture wrapper (new)

---

## Implementation Phases

### Phase 1: Table to Card Transformation (Critical)
**Duration**: 3-4 hours
**Priority**: Highest

#### Objectives
- Convert campaign tables to card-based layouts on mobile
- Each campaign becomes a tappable card with key metrics
- Implement swipe-to-reveal actions
- Add expand/collapse for secondary metrics

#### Technical Details

**CampaignCard Component**
```tsx
// New component: src/components/AdConsole/mobile/CampaignCard.tsx
interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}

// Structure:
// - Primary row: Name, Type badge, Status badge
// - Metrics row: Spend, Sales, ROAS
// - Expandable: CPC, Orders, ACOS, Actions
```

**Card Layout (Mobile)**
```
┌─────────────────────────────────┐
│ ☕ Coffee Filter | Auto | SP    │
│ Status: Enabled | $35/day       │
├─────────────────────────────────┤
│ Spend: $205.20 | Sales: $684   │
│ ROAS: 3.3x | ACOS: 30%        │
├─────────────────────────────────┤
│ [Open] [Pause] [Dup] [Archive] │
└─────────────────────────────────┘
```

**Swipe Actions**
- Swipe left: Reveal action buttons (Pause, Duplicate, Archive)
- Swipe right: Collapse actions
- Long press: Quick actions menu

#### Files to Create/Modify
- `src/components/AdConsole/mobile/CampaignCard.tsx` (new)
- `src/components/AdConsole/mobile/SwipeableActions.tsx` (new)
- `src/components/AdConsole/details/ManagerCampaignsTab.tsx` (modify)
- `src/app/globals.css` (add card styles)

---

### Phase 2: Touch Interactions
**Duration**: 2-3 hours
**Priority**: High

#### Objectives
- Add swipe gestures for campaign actions
- Implement pull-to-refresh on campaign list
- Add long-press for quick actions menu
- Bottom sheet for filter options

#### Technical Details

**Pull-to-Refresh**
```tsx
// New hook: src/lib/usePullToRefresh.ts
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Default: 80px
}

// Implementation:
// - Track touch start/move/end
// - Calculate pull distance
// - Show refresh indicator
// - Trigger refresh on threshold
```

**Bottom Sheet Component**
```tsx
// New component: src/components/AdConsole/mobile/BottomSheet.tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Features:
// - Drag to dismiss
// - Backdrop click to close
// - Smooth spring animation
// - Safe area padding
```

**Filter Bottom Sheet**
- Replace dropdown filters with bottom sheet on mobile
- Multi-select support for type/status filters
- Clear/reset functionality

#### Files to Create/Modify
- `src/lib/usePullToRefresh.ts` (new)
- `src/components/AdConsole/mobile/BottomSheet.tsx` (new)
- `src/components/AdConsole/mobile/FilterSheet.tsx` (new)
- `src/components/AdConsole/CampaignManager.tsx` (modify)

---

### Phase 3: Navigation Improvements
**Duration**: 2 hours
**Priority**: Medium

#### Objectives
- Add bottom navigation bar on mobile
- Improve campaign detail tabs with horizontal scroll + snap
- Add swipe between detail tabs

#### Technical Details

**Bottom Navigation Bar**
```tsx
// New component: src/components/AdConsole/mobile/BottomNav.tsx
const NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard', icon: '📊' },
  { view: 'campaigns', label: 'Campaigns', icon: '📢' },
  { view: 'create', label: 'Create', icon: '+' },
  { view: 'more', label: 'More', icon: '⋯' },
];

// Structure:
// - Fixed bottom position
// - 4-5 navigation items
// - Active state indicator
// - Safe area padding for iPhone notch
```

**Improved Tabs**
```css
/* Horizontal scroll with snap */
.detail-tabs {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.detail-tab {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

**Tab Swipe Navigation**
- Track touch start/end positions
- Calculate swipe direction
- Transition to adjacent tab
- Add visual feedback during swipe

#### Files to Create/Modify
- `src/components/AdConsole/mobile/BottomNav.tsx` (new)
- `src/components/AdConsole/CampaignDetail.tsx` (modify)
- `src/app/globals.css` (add bottom nav styles)

---

### Phase 4: Layout Optimization
**Duration**: 1-2 hours
**Priority**: Medium

#### Objectives
- Optimize dashboard grid for narrow screens
- Improve campaign wizard step flow on mobile
- Better spacing and typography scaling
- Safe area padding for notch devices

#### Technical Details

**Dashboard Grid Optimization**
```css
/* Mobile-first dashboard */
@media (max-width: 768px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .metric-card {
    padding: 16px;
  }
  
  .metric-value {
    font-size: 24px;
  }
}
```

**Wizard Step Flow**
- Single column layout on mobile
- Sticky next/back buttons at bottom
- Progress indicator at top
- Collapsible sections for review step

**Safe Area Handling**
```css
/* iPhone notch support */
@supports (padding-top: env(safe-area-inset-top)) {
  .app-navbar {
    padding-top: env(safe-area-inset-top);
  }
  
  .bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

#### Files to Modify
- `src/app/globals.css` (optimize mobile layouts)
- `src/components/AdConsole/Dashboard.tsx` (modify)
- `src/components/AdConsole/wizard/CreateCampaignWizard.tsx` (modify)

---

### Phase 5: Performance & Polish
**Duration**: 1-2 hours
**Priority**: Low

#### Objectives
- Lazy load campaign list items
- Optimize re-renders on scroll
- Add loading skeletons for mobile
- Test on real devices

#### Technical Details

**Virtualized List**
```tsx
// Use react-window or similar for large lists
import { FixedSizeList } from 'react-window';

// Implement for campaign lists with 50+ items
// Reduces DOM nodes and improves scroll performance
```

**Loading Skeletons**
```tsx
// New component: src/components/AdConsole/mobile/SkeletonCard.tsx
// Matches CampaignCard layout
// Shows during initial load and refresh
```

**Performance Monitoring**
- Track First Contentful Paint (FCP)
- Monitor Largest Contentful Paint (LCP)
- Measure Time to Interactive (TTI)
- Target: FCP < 1.5s, LCP < 2.5s, TTI < 3.5s

#### Files to Create/Modify
- `src/components/AdConsole/mobile/SkeletonCard.tsx` (new)
- `src/components/AdConsole/mobile/VirtualizedList.tsx` (new)
- `src/components/AdConsole/details/ManagerCampaignsTab.tsx` (modify)

---

## Testing Strategy

### Device Testing Matrix
| Device | Browser | Priority |
|--------|---------|----------|
| iPhone 14/15 | Safari | Critical |
| iPhone SE | Safari | High |
| Samsung Galaxy S23 | Chrome | Critical |
| iPad Mini | Safari | Medium |
| Pixel 7 | Chrome | High |

### Test Scenarios
1. **Campaign Management**: Create, edit, delete, duplicate campaigns
2. **Simulation**: Run 7-day simulation, view results
3. **Navigation**: Switch between views, use bottom nav
4. **Filters**: Apply filters, search campaigns
5. **Touch Gestures**: Swipe actions, pull-to-refresh
6. **Performance**: Scroll smoothness, load times

### Accessibility Testing
- Screen reader compatibility (VoiceOver, TalkBack)
- Keyboard navigation support
- Color contrast verification (WCAG AA)
- Touch target size verification (min 44px)

---

## Success Metrics

### Quantitative
- Mobile usability score > 90 (Lighthouse)
- First Contentful Paint < 1.5s on 3G
- Touch target size compliance: 100%
- Zero horizontal scroll on campaign cards

### Qualitative
- Users can complete training flows on mobile
- Touch interactions feel natural and responsive
- No feature loss compared to desktop
- Positive user feedback on mobile experience

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance degradation on low-end devices | Medium | High | Virtualized lists, lazy loading |
| Touch gesture conflicts with browser | Low | Medium | Careful event handling, test early |
| Feature parity issues | Low | High | Comprehensive testing matrix |
| Training effectiveness reduced | Medium | High | User testing with trainees |

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Table to Card | 3-4 hours | None |
| Phase 2: Touch Interactions | 2-3 hours | Phase 1 |
| Phase 3: Navigation | 2 hours | Phase 1 |
| Phase 4: Layout Optimization | 1-2 hours | Phase 1 |
| Phase 5: Performance & Polish | 1-2 hours | All phases |

**Total Estimated Time**: 9-13 hours

---

## Appendix

### Related Files
- `src/app/globals.css` - Global styles and responsive rules
- `src/components/AdConsole/mobile/MobileNav.tsx` - Existing mobile navigation
- `src/engine/ad-console/core/engine/responsive.ts` - Breakpoint utilities
- `src/lib/useBreakpoint.ts` - Breakpoint hook

### References
- [Mobile-First Design Principles](https://www.freecodecamp.org/news/mobile-first-design/)
- [Touch Target Size Guidelines](https://www.w3.org/WAI/WCAG21/Target-size.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics)
