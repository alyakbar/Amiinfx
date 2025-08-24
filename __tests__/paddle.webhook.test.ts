import { POST } from '@/app/api/paddle/webhook/route';

jest.mock('@/lib/firestore-admin', () => ({
  saveMpesaTransaction: jest.fn(() => Promise.resolve(true)),
  saveTransaction: jest.fn(() => Promise.resolve(true)),
}));

import { saveMpesaTransaction, saveTransaction } from '@/lib/firestore-admin';

describe('Paddle webhook route', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saves webhook and unified transaction for successful payment', async () => {
    const payload = {
      alert_name: 'payment_succeeded',
      email: 'buyer@example.com',
      amount: '49.99',
      currency: 'USD',
      order_id: 'ORDER12345',
      customer_name: 'Alice Buyer',
    };

    const mockReq = {
      text: async () => JSON.stringify(payload),
    } as any;

    const res = await POST(mockReq);
    // Expect a JSON response with success true
    const json = await res.json();
    expect(json.success).toBe(true);

    // Firestore helpers should be called
    expect(saveMpesaTransaction).toHaveBeenCalled();
    expect(saveTransaction).toHaveBeenCalled();

    const callArgs = (saveTransaction as jest.Mock).mock.calls[0][0];
    expect(callArgs.type).toBe('paddle');
    expect(callArgs.email).toBe('buyer@example.com');
    expect(callArgs.reference).toContain('ORDER12345');
  });
});
