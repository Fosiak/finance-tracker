// Hoisted from LandingPage.jsx's local constant - the one place in the
// app that already had a deliberate, visible keyboard-focus treatment.
// Apply to any interactive element (button/link/NavLink) that doesn't
// already define its own focus style.
export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
