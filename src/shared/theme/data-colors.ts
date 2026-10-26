/** Runtime CSS tokens also work in SVG fill/stroke and inline category backgrounds. */
export const categoryColors = Array.from(
  { length: 14 },
  (_, index) => `rgb(var(--color-category-${index + 1}))`,
);
export const chartColors = Array.from(
  { length: 10 },
  (_, index) => `rgb(var(--color-chart-${index + 1}))`,
);
