/**
 * JSON-LD structured data block. Server-safe (pure render, no hooks).
 * `<` is escaped so no payload can ever terminate the script tag early;
 * \u003c decodes identically when engines parse the JSON.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
