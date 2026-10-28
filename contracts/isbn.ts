/** Canonical ISBN-13; rejects malformed values without changing legacy stored data. */
export function normalizeIsbn(input: string): string | null {
  const isbn = input.replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce((n, c, i) => n + (c === 'X' ? 10 : Number(c)) * (10 - i), 0);
    if (sum % 11) return null;
    const prefix = `978${isbn.slice(0, 9)}`;
    const check =
      (10 - ([...prefix].reduce((n, c, i) => n + Number(c) * (i % 2 ? 3 : 1), 0) % 10)) % 10;
    return `${prefix}${check}`;
  }
  if (!/^97[89]\d{10}$/.test(isbn)) return null;
  return [...isbn].reduce((n, c, i) => n + Number(c) * (i % 2 ? 3 : 1), 0) % 10 === 0 ? isbn : null;
}
