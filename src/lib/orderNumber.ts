/**
 * Human-friendly order number: TechBD-XXXXXXX (7 chars from an
 * unambiguous alphabet — no I/O/0/1 lookalikes). 32^7 ≈ 34 billion
 * combinations; the DB's unique constraint on order_number is the real
 * guard. Used by Checkout when persisting the order, and by the
 * confirmation page only as a cosmetic fallback.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeOrderNumber(): string {
  let suffix = '';
  for (let i = 0; i < 7; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `TechBD-${suffix}`;
}
