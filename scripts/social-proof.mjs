export const SOCIAL_PROOF_COUNTS = Object.freeze({
  cambridge: 94000,
  chef: 123000,
  grammar: 176000,
  harvard: 108000,
  iq: 212000,
  marry: 184000,
  mechanic: 87000,
  memory: 241000,
  midwifery: 76000,
  nursing: 138000,
  oxford: 112000,
  paramedic: 149000,
  vision: 203000,
  "years-left": 267000,
});
export function socialProofCountFor(slug) {
  const count = SOCIAL_PROOF_COUNTS[slug];
  if (!Number.isInteger(count)) throw new Error(`Missing stable social-proof count for ${slug}`);
  return count;
}
