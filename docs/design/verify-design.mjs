import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Run after exporting DESIGN.md with @google/design.md (see REVIEW.md).
const directory = fileURLToPath(new URL('.', import.meta.url));
const tokens = JSON.parse(readFileSync(`${directory}reading-room.tokens.json`, 'utf8'));
const source = readFileSync(new URL('../../DESIGN.md', import.meta.url), 'utf8');
// This intentionally accepts the authored one-line quoted HEX syntax, not arbitrary YAML.
const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
assert.ok(frontmatter, 'Missing DESIGN.md frontmatter');
const colorBlock = frontmatter.match(/^colors:\r?\n([\s\S]*?)(?=^\S)/m)?.[1];
assert.ok(colorBlock, 'Missing colors block');
const authoredColors = Object.fromEntries(
  colorBlock
    .trimEnd()
    .split(/\r?\n/)
    .map((line) => {
      const entry = line.match(/^ {2}([a-z0-9-]+): "(#[A-Fa-f0-9]{6})"$/);
      assert.ok(entry, `Unsupported color syntax: ${line}`);
      return [entry[1], entry[2].toUpperCase()];
    }),
);
const exportedColors = Object.fromEntries(
  Object.entries(tokens.color)
    .filter(([name]) => !name.startsWith('$'))
    .map(([name, token]) => [name, token.$value.hex.toUpperCase()]),
);
assert.deepEqual(
  Object.keys(exportedColors).sort(),
  Object.keys(authoredColors).sort(),
  'Color token sets differ between source and export',
);
assert.deepEqual(exportedColors, authoredColors, 'Source/export color values differ');
const modes = {};
for (const mode of ['light', 'dark']) {
  modes[mode] = Object.fromEntries(
    Object.entries(tokens.color)
      .filter(([name]) => name.startsWith(`${mode}-`))
      .map(([name, token]) => [name.slice(mode.length + 1), token.$value.hex.toUpperCase()]),
  );
}
assert.deepEqual(Object.keys(modes.light), Object.keys(modes.dark), 'Theme roles must match');
for (const [mode, colors] of Object.entries(modes)) {
  for (const [role, value] of Object.entries(colors)) {
    const authored = source.match(new RegExp(`^  ${mode}-${role}: "(#[A-Fa-f0-9]{6})"$`, 'm'));
    assert.equal(value, authored?.[1].toUpperCase(), `Export drift: ${mode}/${role}`);
  }
}
const channels = (hex) =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
function luminance(hex) {
  const linear = channels(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (values[1] + 0.05) / (values[0] + 0.05);
}
const checks = [];
const add = (fg, bg, minimum, kind, onlyMode) => checks.push({ fg, bg, minimum, kind, onlyMode });
for (const fg of ['ink', 'secondary', 'muted']) {
  for (const bg of ['canvas', 'chrome', 'surface', 'raised', 'hover', 'selected']) {
    add(fg, bg, 4.5, 'text');
  }
}
for (const bg of ['action', 'action-hover', 'action-pressed']) add('on-action', bg, 4.5, 'button');
for (const bg of ['surface', 'raised', 'canvas']) add('action', bg, 4.5, 'link');
add('on-disabled', 'disabled', 4.5, 'disabled (voluntary)');
add('on-danger', 'danger-solid', 4.5, 'danger button');
for (const role of ['success', 'danger', 'warning', 'info']) {
  add(role, `${role}-subtle`, 4.5, 'status');
  add(role, 'raised', 4.5, 'status text');
}
add('danger-hover', 'raised', 4.5, 'danger hover');
for (const bg of ['chrome', 'canvas', 'surface', 'raised', 'hover', 'selected']) {
  add('focus', bg, 3, 'focus');
}
for (const bg of ['surface', 'raised', 'canvas']) add('control', bg, 3, 'control boundary');
for (let i = 1; i <= 6; i++) add(`chart-${i}`, 'surface', 3, 'chart vs plot only');
for (const bg of ['nav-selected', 'nav-selected-hover']) {
  add('nav-on-selected', bg, 4.5, 'navigation text/icon');
  add(bg, 'chrome', 3, 'light navigation current-page fill', 'light');
}
add('secondary', 'nav-hover', 4.5, 'navigation hover text');
add('focus', 'nav-hover', 3, 'navigation focus outside 2px gap');
for (let i = 1; i <= 14; i++) add('category-ink', `category-${i}`, 4.5, 'topic chip');
const results = Object.entries(modes).flatMap(([mode, colors]) =>
  checks
    .filter(({ onlyMode }) => !onlyMode || onlyMode === mode)
    .map(({ fg, bg, minimum, kind }) => {
      const ratio = contrast(colors[fg], colors[bg]);
      return { mode, fg, bg, minimum, kind, ratio, pass: ratio >= minimum };
    }),
);
const failures = results.filter((result) => !result.pass);
console.log(
  JSON.stringify(
    { rolesPerMode: Object.keys(modes.light).length, checks: results.length, failures },
    null,
    2,
  ),
);
// On any failure, preserve existing generated files; print diagnostics and exit before writes.
assert.equal(failures.length, 0, 'Contrast failures; existing generated files were preserved');
const dimension = (token) => `${token.$value.value}${token.$value.unit}`;
const css = [
  '/* Generated proposal from DESIGN.md → reading-room.tokens.json. Not imported by the app. */',
  ...Object.entries(modes).map(([mode, colors]) => {
    const selector = mode === 'light' ? ':root,\n[data-theme="light"]' : '[data-theme="dark"]';
    const values = Object.entries(colors).flatMap(([role, hex]) => [
      `  --rr-${role}: ${hex.toLowerCase()};`,
      `  --rr-${role}-rgb: ${channels(hex).join(' ')};`,
    ]);
    return `${selector} {\n  color-scheme: ${mode};\n${values.join('\n')}\n}`;
  }),
  ':root {',
  '  /* OS-expanded font stack and motion are manually maintained aliases; see DESIGN.md. */',
  '  --rr-font-ui: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", sans-serif;',
  '  --rr-font-book: "MaruBuri", serif;',
  `  --rr-radius-control: ${dimension(tokens.rounded.md)};`,
  `  --rr-radius-dialog: ${dimension(tokens.rounded.lg)};`,
  `  --rr-type-input-size: ${dimension({ $value: tokens.typography['body-md'].$value.fontSize })};`,
  `  --rr-type-ui-size: ${dimension({ $value: tokens.typography.ui.$value.fontSize })};`,
  '  --rr-duration-hover: 100ms;',
  '  --rr-duration-enter: 140ms;',
  '  --rr-ease: cubic-bezier(0.2, 0, 0, 1);',
  '}',
  '',
].join('\n');
writeFileSync(`${directory}reading-room.tokens.css`, css);
const report = [
  '# 제안 색상 대비 검사',
  '',
  '생성: `node docs/design/verify-design.mjs`. DESIGN.md 원본과 DTCG HEX 값의 일치 및 양 모드 역할 일치를 검사한다.',
  '색상 키 집합은 양방향으로 비교한다. 비색상 전체 동기화 검사는 아니며 서체·간격·모션은 수동 리뷰가 필요하다.',
  'WCAG sRGB 상대 휘도 공식, 불투명 단색 쌍만 검사. 전체 제품 접근성·색각·인접 차트 판별 검증이 아니다.',
  '',
  `- 모드별 의미색: ${Object.keys(modes.light).length}개 (스키마 primary 별칭 제외)`,
  `- 검사한 쌍: ${results.length}개`,
  `- 통과: ${results.length - failures.length}개 / 실패: ${failures.length}개`,
  '- 구분선 rule은 장식용이므로 3:1 검사 대상이 아님. 기능적 경계는 control로 별도 검사.',
  '- disabled는 WCAG 예외이지만 여기서는 자발적으로 4.5:1 이상을 검사.',
  '',
  '| 모드 | 전경 / 배경 | 목적 | 대비 | 기준 | 결과 |',
  '| --- | --- | --- | --- | --- | --- |',
  ...results.map(
    (r) =>
      `| ${r.mode} | ${r.fg} / ${r.bg} | ${r.kind} | ${r.ratio.toFixed(2)}:1 | ${r.minimum}:1 | ${r.pass ? 'PASS' : 'FAIL'} |`,
  ),
  '',
].join('\n');
writeFileSync(`${directory}contrast-report.md`, report);
