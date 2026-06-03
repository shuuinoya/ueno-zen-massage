# UENO ZEN MASSAGE — Vercel デプロイガイド

## ファイル構成

```
ueno-zen-vercel/
├── index.html                    ← 予約サイト本体
├── api/
│   ├── create-payment-intent.js  ← Stripe決済API
│   └── send-notifications.js     ← メール通知API
├── vercel.json                   ← Vercel設定
├── package.json
└── README.md
```

---

## ⚡ デプロイ手順（5分で完了）

### 1. Vercel アカウント作成
https://vercel.com/signup（無料）

### 2. このフォルダをGitHubにアップロード
- GitHub.com → New repository → ファイルをドラッグ&ドロップ

### 3. Vercel にインポート
- https://vercel.com/new
- GitHubリポジトリを選択 → Deploy

### 4. 環境変数を設定
Vercel Dashboard → プロジェクト → Settings → Environment Variables

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `STRIPE_SECRET_KEY` | `sk_live_XXXXXXXXXX` | Stripeシークレットキー |
| `SENDGRID_API_KEY` | `SG.XXXXXXXXXX` | SendGrid APIキー（メール送信） |
| `OWNER_EMAIL` | `your@email.com` | 管理者メールアドレス |
| `FROM_EMAIL` | `noreply@yourdomain.com` | 送信元メール（SendGridで認証済みのもの） |

### 5. 再デプロイ
環境変数設定後 → Deployments → Redeploy

---

## 🔑 各APIキーの取得場所

### Stripe シークレットキー
1. https://dashboard.stripe.com/apikeys
2. 「シークレットキー」→「公開する」
3. `sk_live_...` をコピー

### SendGrid APIキー（無料で月100通）
1. https://sendgrid.com/ → 無料登録
2. Settings → API Keys → Create API Key
3. Full Access で作成 → `SG.` から始まるキーをコピー
4. Settings → Sender Authentication → メールアドレスを認証

---

## 📧 通知の仕組み

予約完了後に自動で送信されます：

| 送信先 | 内容 |
|--------|------|
| お客様メール | 予約確認・決済明細・リマインダーのご案内 |
| 管理者メール | 新規予約通知・お客様SNS ID・決済ID |

### リマインダー（24時間前）
- Instagram / Threads は管理者が手動でDM送信
  （メール通知に「SNS ID: @xxx」が記載されています）
- 自動DM送信はMeta APIの制限のため手動対応推奨

---

## ✅ 動作確認

デプロイ後、Stripeテストモードで確認：
- テストカード: `4242 4242 4242 4242`
- 有効期限: 任意の将来の日付
- CVC: 任意の3桁

本番切り替え前にStripeダッシュボードで決済履歴を確認してください。
