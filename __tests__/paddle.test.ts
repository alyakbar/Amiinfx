import { canonicalizePayload, verifyPaddleSignature } from '@/lib/paddle';

describe('paddle helper', () => {
  test('canonicalizePayload stable ordering', () => {
    const a = { b: 1, a: 2 };
    const b = { a: 2, b: 1 };
    expect(canonicalizePayload(a)).toEqual(canonicalizePayload(b));
  });

  test('verifyPaddleSignature returns false with missing key', () => {
    const payload = { hello: 'world' };
    const res = verifyPaddleSignature(payload, '', '');
    expect(res).toBe(false);
  });
});
