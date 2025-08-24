import crypto from 'crypto';

// Canonicalize an object by sorting keys recursively and returning a stable JSON string.
// This is a best-effort canonicalization for signature verification. Paddle's PHP
// serialization differs from JSON serialization; if you need exact parity, replace
// this with a canonicalizer that matches Paddle's serialize() behavior.
export function canonicalizePayload(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(canonicalizeValue));
  }

  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const sorted: Record<string, unknown> = {};
  for (const k of keys) sorted[k] = canonicalizeValue(record[k]);
  return JSON.stringify(sorted);
}

function canonicalizeValue(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(canonicalizeValue);
  const record = v as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = canonicalizeValue(record[k]);
  return out;
}

export function verifyPaddleSignature(payloadObj: unknown, signatureBase64: string, publicKeyPem: string): boolean {
  if (!publicKeyPem) return false;

  const canonical = canonicalizePayload(payloadObj);

  // Paddle signs the serialized payload with RSA using their private key. The
  // exact digest algorithm isn't documented consistently; historically many
  // implementations use SHA1. If your Paddle public key requires a different
  // algorithm, change 'RSA-SHA1' accordingly.
  const verifier = crypto.createVerify('RSA-SHA1');
  verifier.update(canonical);
  verifier.end();

  const signature = Buffer.from(signatureBase64, 'base64');
  try {
    return verifier.verify(publicKeyPem, signature);
  } catch (err) {
    console.warn('Paddle signature verification error:', err);
    return false;
  }
}
