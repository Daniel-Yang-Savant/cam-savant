function scrubSourceBrand(value) {
  if (typeof value === 'string') return value.replace(/icare/gi, '').replace(/\s{2,}/g, ' ').trim();
  if (Array.isArray(value)) return value.map(scrubSourceBrand);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, scrubSourceBrand(entry)]));
  }
  return value;
}

// Keep internal provenance in the audit files only. Everything returned by the
// website uses neutral labels, including any older KV payload written before
// this reference-library migration.
export function toPublicReferenceProtocols(protocols) {
  if (!Array.isArray(protocols)) return [];
  return protocols.map(protocol => {
    const neutralId = String(protocol?.id || '').replace(/^icare_mb_/i, 'mb_ref_');
    const cleaned = scrubSourceBrand({ ...protocol, id: neutralId });
    return {
      ...cleaned,
      source: 'Reference',
      category: '參考協定',
      _ref: true
    };
  });
}
