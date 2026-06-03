// api/create-payment-intent.js
// Vercel Serverless Function — Stripe PaymentIntent 作成
//
// 環境変数（Vercel Dashboard → Settings → Environment Variables）:
//   STRIPE_SECRET_KEY = sk_live_XXXXXXXXXXXXXXXXXXXXXXXXX
//
import Stripe from 'stripe';

export default async function handler(req, res) {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Stripeシークレットキーチェック
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY が設定されていません' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  try {
    const { amount, currency, email, name, description } = req.body;

    // バリデーション
    if (!amount || !currency || !email) {
      return res.status(400).json({ error: '必須パラメータが不足しています' });
    }

    // JPY は整数（センスなし）、USD は cents
    const stripeAmount = currency === 'jpy' ? Math.round(amount) : Math.round(amount * 100);

    // PaymentIntent 作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount:        stripeAmount,
      currency:      currency,       // 'jpy'
      receipt_email: email,
      description:   description || 'UENO ZEN MASSAGE',
      metadata: {
        customer_name:  name  || '',
        customer_email: email || '',
        service:        description || '',
      },
      // 自動決済確認（カード決済向け）
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({
      error: err.message || '決済の初期化に失敗しました',
    });
  }
}
