/**
 * Astryx component module augmentation — Amazon platform extensions.
 *
 * Astryx core ships with 4 stock Button variants: primary, secondary, ghost,
 * destructive. The Amazon platform theme uses 5 visual variants:
 *
 *   1. secondary (Amazon: `.btn` — neutral, white surface, dark text)
 *   2. primary   (Amazon: `.btn.primary` — Amazon orange #ff9900, dark text)
 *   3. info      (Amazon: `.btn.blue` — Amazon teal #007185, white text) ← custom
 *   4. destructive (Amazon: `.btn.danger` — Amazon red #cc0c39, outline style)
 *   5. (no warn variant in current usage, but reserved for parity)
 *
 * The 4th stock variant `ghost` maps to Amazon's "no border, transparent
 * bg" tertiary look (not used in the current codebase, but reserved).
 *
 * Custom variants are added here via TypeScript module augmentation so
 * `<Button variant="info" />` type-checks. The matching visual styles are
 * defined in `src/app/astryx-theme.css` under selectors like
 * `.astryx-button[data-variant="info"]` — Astryx emits `data-variant` via
 * its `themeProps()` helper, so the bridge can target custom variants
 * without rebuilding the theme.
 *
 * This file is consumed automatically by the TS compiler and never imported
 * at runtime — pure type-level augmentation.
 */
declare module '@astryxdesign/core/Button' {
  interface ButtonVariantMap {
    /**
     * Amazon teal #007185 (info-soft #e0f2f5 background, white text).
     * Used for "Run 7-day sim" and other run-now actions that need to
     * read as informational rather than primary (orange) or destructive
     * (red).
     */
    info: true;
    /**
     * Amazon warning #b12704. Reserved for future use (the current
     * codebase has no `.btn.warn` in active use, but the migration plan
     * calls for parity so the variant is available when needed).
     */
    warning: true;
  }
}

export {};
