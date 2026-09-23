import 'server-only';

/**
 * Minimal RFC-4180-ish CSV builder shared by both admin table exports:
 * quotes fields containing commas, quotes or newlines; doubles embedded
 * quotes. BOM prefix keeps Excel happy with UTF-8 (৳ etc.).
 */
export function toCsv(headers: string[], rows: (string | number | boolean)[][]): string {
  const escape = (value: string | number | boolean): string => {
    const s = String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return '\uFEFF' + lines.join('\r\n');
}
