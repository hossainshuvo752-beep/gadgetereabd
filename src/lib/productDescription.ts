import type { Product } from './products';
import { BRAND_NAME } from './brand';

/**
 * Shared Product DESCRIPTION builder — the ONE sentence generator for the
 * Product JSON-LD description AND every meta/og/twitter description that
 * describes a product by its specs, so all surfaces stay consistent.
 *
 * RULE: never insert a spec field whose value is empty or non-applicable
 * (values like "", "-", "N/A", "None", "n/a", "TBD", "Unknown", or text
 * STARTING with those markers). Products without a display (headphones,
 * earbuds, power bank, keyboard, USB-C hub, robot vacuum, console) or with
 * unknown dimensions used to leak strings like "N/A None (outputs to
 * external TV/monitor)" into the sentence — the filter below makes the
 * sentence skip those fields entirely while still reading naturally.
 * NO INVENTION: only values that exist in the product's own spec sheet
 * are ever used; a field with no usable value is simply not mentioned.
 */

/** Markers that mean "this spec field has no usable value". */
const NA_MARKERS = [
  'n/a',
  'na',
  'tbd',
  'none',
  'unknown',
  '-',
  '–',
  // Apple's spec sheets print "Not listed by Apple" / "Not specified by
  // Apple" where a value does not exist (the HomeView's RAM, storage and
  // refresh rate). Those are absences, not specs — quoting them in a
  // generated sentence would be noise, so they are skipped like N/A.
  'not listed',
  'not specified',
  'not named',
];

/**
 * Is this spec value usable for the description sentence?
 * False for empty/whitespace values, values equal (case-insensitively) to
 * a non-applicable marker, and values that START with a marker (e.g.
 * "N/A (mains powered)", "None (outputs to external TV/monitor)").
 */
export function isUsableSpecValue(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v === '') return false;
  const lower = v.toLowerCase();
  return !NA_MARKERS.some((marker) => lower.startsWith(marker));
}

/**
 * Spec-driven product description, all product types read naturally:
 *   - phone/tablet: "<brand model>: 6.31 inches LTPO OLED (1.5K), Snapdragon
 *     8 Elite Gen 5, 512GB/1TB. Full specs and Bangladesh price on <brand>."
 *   - display-less device (headphones/console/hub/power bank/vacuum):
 *     "<brand model>: Integrated Processor V1 + QN1 (dual noise-cancelling
 *     DSP), 250g. Full specs and Bangladesh price on <brand>."
 * Weight is a data-backed, display-independent detail that keeps the
 * otherwise-short sentences for spec-light products from reading bare.
 * Every clause comes ONLY from a usable spec field.
 */
export function productSpecDescription(
  product: Product,
  brandModel: string
): string {
  const { specSheet: spec } = product;

  const clauses: string[] = [];

  // Display: "size type" ONLY when both are usable ("6.31 inches LTPO
  // OLED (1.5K)"); skipped entirely for devices without a display.
  const size = spec.display.size;
  const type = spec.display.type;
  if (isUsableSpecValue(size) && isUsableSpecValue(type)) {
    clauses.push(`${size.trim()} ${type.trim()}`);
  } else if (isUsableSpecValue(size)) {
    clauses.push(`${size.trim()}`);
  } else if (isUsableSpecValue(type)) {
    clauses.push(type.trim());
  }

  const processor = spec.performance.processor;
  if (isUsableSpecValue(processor)) clauses.push(processor.trim());

  const storage = spec.performance.storage;
  if (isUsableSpecValue(storage)) clauses.push(storage.trim());

  const weight = spec.buildDesign.weight;
  if (isUsableSpecValue(weight)) clauses.push(weight.trim());

  const clauseText = clauses.join(', ');
  // Defensive: with EVERY candidate field unusable, drop the clause part
  // instead of emitting "<brand model>: . Full specs…".
  if (!isUsableSpecValue(clauseText)) {
    return `${brandModel} — full specifications and Bangladesh price on ${BRAND_NAME}.`;
  }
  return `${brandModel}: ${clauseText}. Full specs and Bangladesh price on ${BRAND_NAME}.`;
}
