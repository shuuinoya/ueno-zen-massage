// api/create-payment-intent.js
// メニュー番号からサーバー側で金額を計算 → クライアントからの金額改ざん不可
import Stripe from 'stripe';

const OUTCALL_FEE = 2200;

const MENU_PRICES = {
  1:  { price: 13000, name: 'オイルマッサージ 60min' },
  2:  { price: 17000, name: 'オイルマッサージ 90min' },
  3:  { price: 22000, name: 'オイルマッサージ 120min' },
  4:  { price:  9900, name: '全身マッサージ 60min' },
  5:  { price: 12000, name: '全身マッサージ 90min' },
  6:  { price: 15000, name: '全身マッサージ 120min' },
  7:  { price:  8800, name: 'フェイシャルスリミング 60min' },
  8:  { price: 10500, name: 'フェイシャルスリミング 90min' },
  9:  { price: 13000, name: 'フェイシャルスリミング 120min' },
  10: { price:  8800, name: 'フットマッサージ 60min' },
  11: { price: 10500, name: 'フットマッサージ 90min' },
  12: { price: 13000, name: 'フットマッサージ 120min' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY が未設定です' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

  const { menuNum, email, name, date, time } = req.body;

  const menu = MENU_PRICES[parseInt(menuNum, 10)];
  if (!menu) {
    return res.status(400).json({ error: '無効なメニューです' });
  }

  const total = menu.price + OUTCALL_FEE;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:        total,
      currency:      'jpy',
      receipt_email: email,
      description:   `${menu.name} — ${date || ''} ${time || ''}`,
      metadata: {
        menu_num:      String(menuNum),
        menu_name:     menu.name,
        menu_price:    String(menu.price),
        outcall_fee:   String(OUTCALL_FEE),
        total:         String(total),
        customer_name: name  || '',
        date:          date  || '',
        time:          time  || '',
      },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      total,
    });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message || '決済の初期化に失敗しました' });
  }
}
