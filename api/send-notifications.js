// api/send-notifications.js — Resend でメール送信
// Vercel環境変数:
//   RESEND_API_KEY = re_XXXXXXXXXX  （resend.com で取得）
//   OWNER_EMAIL    = あなたのメールアドレス

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY が未設定のため通知をスキップします');
    return res.status(200).json({ ok: true, skipped: true });
  }

  const {
    customerEmail, customerSocial,
    name, service, date, time, total, payment, paymentId, lang
  } = req.body;

  const OWNER = process.env.OWNER_EMAIL || 'kudaka.1228@gmail.com';
  // Resendの無料プランでは onboarding@resend.dev から送信可能
  // 独自ドメインがあれば FROM_EMAIL 環境変数で上書き
  const FROM = process.env.FROM_EMAIL || 'UENO ZEN MASSAGE <onboarding@resend.dev>';

  const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}
  .hd{background:#080808;padding:28px 32px;text-align:center}
  .logo{color:#b8965a;font-size:1.1rem;letter-spacing:.2em;text-transform:uppercase}
  .body{padding:32px}
  .title{font-size:1.3rem;color:#1a1a1a;margin-bottom:6px}
  .sub{font-size:.85rem;color:#888;margin-bottom:24px}
  .table{width:100%;border-collapse:collapse}
  .table td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:.88rem}
  .table td:first-child{color:#888;width:38%}
  .table td:last-child{color:#1a1a1a;font-weight:500}
  .total-box{background:#faf7f2;border:1px solid #e8d9c0;border-radius:6px;padding:16px;text-align:center;margin:20px 0}
  .total-lbl{font-size:.72rem;color:#888;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
  .total-amt{font-size:1.6rem;color:#b8965a;font-weight:300}
  .reminder{background:#f0f7f0;border-left:3px solid #4a9e74;padding:12px 16px;font-size:.8rem;color:#555;margin:16px 0;line-height:1.7}
  .ft{background:#f5f5f5;padding:16px 32px;text-align:center;font-size:.72rem;color:#aaa}
</style></head>
<body>
<div class="wrap">
  <div class="hd"><div class="logo">UENO ZEN MASSAGE</div></div>
  <div class="body">
    <div class="title">ご予約ありがとうございます</div>
    <div class="sub">Thank you for your reservation.</div>
    <table class="table">
      <tr><td>お名前</td><td>${name}</td></tr>
      <tr><td>サービス</td><td>${service}</td></tr>
      <tr><td>日時</td><td>${date} ${time}</td></tr>
      <tr><td>お支払い</td><td>${payment}</td></tr>
      ${paymentId ? `<tr><td>決済ID</td><td style="font-size:.75rem;color:#888">${paymentId}</td></tr>` : ''}
    </table>
    <div class="total-box">
      <div class="total-lbl">お支払い合計</div>
      <div class="total-amt">${total}</div>
    </div>
    <div class="reminder">
      ⏰ <strong>リマインダー</strong><br>
      ご予約の24時間前に Instagram / Threads よりご連絡いたします。<br>
      We will remind you 24 hours before via Instagram / Threads.
    </div>
    <p style="font-size:.78rem;color:#888;margin-top:20px;line-height:1.7">
      ご不明な点はInstagramまたはThreadsよりお問い合わせください。<br>
      For any questions, please contact us via Instagram or Threads.
    </p>
  </div>
  <div class="ft">© UENO ZEN MASSAGE · Tokyo, Japan</div>
</div>
</body></html>`;

  const ownerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}
  .hd{background:#080808;padding:20px 28px;display:flex;align-items:center;justify-content:space-between}
  .logo{color:#b8965a;font-size:.9rem;letter-spacing:.15em}
  .badge{background:#4a9e74;color:#fff;font-size:.65rem;padding:3px 10px;border-radius:3px;font-weight:600}
  .body{padding:24px 28px}
  .title{font-size:1.1rem;color:#1a1a1a;margin-bottom:16px}
  .table{width:100%;border-collapse:collapse}
  .table td{padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:.85rem}
  .table td:first-child{color:#888;width:35%}
  .table td:last-child{color:#1a1a1a;font-weight:500}
  .amt{font-size:1.3rem;color:#b8965a !important}
  .social-id{background:#f5f5f5;border-radius:4px;padding:10px 14px;margin-top:14px;font-size:.82rem}
  .ft{background:#f5f5f5;padding:12px 28px;text-align:center;font-size:.7rem;color:#aaa}
</style></head>
<body>
<div class="wrap">
  <div class="hd">
    <div class="logo">UENO ZEN MASSAGE</div>
    <div class="badge">NEW BOOKING</div>
  </div>
  <div class="body">
    <div class="title">🔔 新規予約が入りました</div>
    <table class="table">
      <tr><td>お名前</td><td>${name}</td></tr>
      <tr><td>メール</td><td>${customerEmail}</td></tr>
      <tr><td>SNS ID</td><td>${customerSocial || '未入力'}</td></tr>
      <tr><td>サービス</td><td>${service}</td></tr>
      <tr><td>日時</td><td><strong>${date} ${time}</strong></td></tr>
      <tr><td>お支払い</td><td>${payment}</td></tr>
      <tr><td>合計</td><td class="amt">${total}</td></tr>
      ${paymentId ? `<tr><td>Stripe ID</td><td style="font-size:.72rem;color:#888">${paymentId}</td></tr>` : ''}
    </table>
    <div class="social-id">
      📱 <strong>リマインダー送信先SNS:</strong> ${customerSocial || '未登録'}<br>
      <span style="font-size:.76rem;color:#888">予約24時間前にInstagram / ThreadsよりDMを送信してください</span>
    </div>
  </div>
  <div class="ft">UENO ZEN MASSAGE · Admin Notification</div>
</div>
</body></html>`;

  const sendEmail = async (to, subject, html) => {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!r.ok) {
      const err = await r.text();
      throw new Error(`Resend error: ${r.status} — ${err}`);
    }
  };

  try {
    const subjectCustomer = lang === 'ja'
      ? `【予約確認】${name} 様 / ${date} ${time}`
      : `[Booking Confirmed] ${name} / ${date} ${time}`;

    await sendEmail(customerEmail, subjectCustomer, customerHtml);
    await sendEmail(OWNER, `【新規予約】${name} / ${date} ${time}`, ownerHtml);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(200).json({ ok: true, emailError: err.message });
  }
}
