import COURSE_REFERENCE from '../../data/fsm/course-reference-2026-10-25.json';

const COURSE_ADDITION_ID = 'course-2026-10-25';

function assertProtocolList(protocols) {
  if (!Array.isArray(protocols)) throw new Error('Invalid saved reference protocols');
  const ids = new Set();
  for (const protocol of protocols) {
    if (!protocol || typeof protocol !== 'object' || Array.isArray(protocol) ||
      typeof protocol.id !== 'string' || !protocol.id.trim() || !Array.isArray(protocol.steps) || ids.has(protocol.id)) {
      throw new Error('Invalid saved reference protocol');
    }
    ids.add(protocol.id);
  }
}

export function resolveReferenceProtocols(stored, seed) {
  let protocols;
  let appliedAdditions = [];
  if (stored === null) {
    protocols = seed;
  } else if (Array.isArray(stored)) {
    protocols = stored;
  } else {
    if (!stored || stored.version !== 4 || !Array.isArray(stored.applied_additions) ||
      !stored.applied_additions.every(id => typeof id === 'string' && id.trim())) {
      throw new Error('Invalid saved reference library');
    }
    protocols = stored.protocols;
    appliedAdditions = stored.applied_additions;
  }
  assertProtocolList(protocols);
  if (appliedAdditions.includes(COURSE_ADDITION_ID)) return protocols;

  // Only this new batch is added; preserve existing edits and all other removals.
  const ids = new Set(protocols.map(protocol => protocol.id));
  return [...protocols, ...COURSE_REFERENCE.filter(protocol => !ids.has(protocol.id))];
}

export function toStoredReferenceProtocols(protocols) {
  assertProtocolList(protocols);
  // An explicit replacement also records omissions, so deleted additions stay deleted.
  return { version: 4, protocols, applied_additions: [COURSE_ADDITION_ID] };
}

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
    const category = String(cleaned.category || '').trim();
    return {
      ...cleaned,
      source: 'Reference',
      category: category && category !== '參考協定' ? category : '全身調節與恢復',
      _ref: true
    };
  });
}
