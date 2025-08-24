import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { amount, currency } = req.body;

        try {
            const response = await axios.post('https://api.binance.com/v3/order', {
                symbol: currency,
                side: 'BUY',
                type: 'MARKET',
                quantity: amount,
            }, {
                headers: {
                    'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
                },
            });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: 'Payment processing failed' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}