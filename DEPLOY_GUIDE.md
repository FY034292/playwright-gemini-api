# Playwright Gemini API - デプロイガイド

Vercelの認証問題を回避するための代替デプロイ方法

## ローカル実行（推奨：テスト用）

```bash
# 1. 依存関係をインストール
npm install

# 2. サーバーを起動
npm start

# 3. 別ターミナルでテスト
curl -X POST http://localhost:3000/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "こんにちは"}'
```

## クラウドデプロイオプション

### 1. Render.com （推奨）

#### Web UIでデプロイ
1. https://render.com でアカウント作成
2. 「New Web Service」をクリック
3. GitHubリポジトリを接続
4. 設定値：
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free

#### Render CLI でデプロイ
```bash
# Render CLI インストール
npm install -g @render/cli

# ログイン
render auth login

# デプロイ（render.yaml使用）
render deploy
```

### 2. Railway.app

```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
railway init

# デプロイ
railway up
```

**注意**: 無料プランの制限により使用できない場合があります

### 3. Heroku

```bash
# Heroku CLI インストール後
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 4. Vercel（認証問題あり）

```bash
# Vercel CLI でデプロイ
npm run deploy
```

**問題**: アカウント設定により認証が強制される場合があります

## 完成後のAPIエンドポイント

### ヘルスチェック
```
GET https://your-app.onrender.com/
```

### Gemini自動化
```
POST https://your-app.onrender.com/api/gemini-automation

{
  "prompt": "あなたのプロンプト"
}
```

## ファイル構成

```
.
├── server.js              # Express サーバー（メイン）
├── Dockerfile             # Docker設定
├── render.yaml            # Render.com設定
├── package.json           # 依存関係
├── api/
│   └── gemini-automation.js # Vercel版API関数
├── vercel.json            # Vercel設定
├── README.md              # 基本ガイド
├── README_RAILWAY.md      # Railway専用ガイド
├── DEPLOY_GUIDE.md        # このファイル
├── test-api.js           # APIテストツール
└── index.js              # 元のローカル実行ファイル
```

## トラブルシューティング

### メモリ不足エラー
```bash
# Node.jsのメモリ制限を増やす
node --max-old-space-size=4096 server.js
```

### Playwrightエラー
```bash
# ブラウザを再インストール
npx playwright install chromium
```

### ポートエラー
```bash
# 環境変数でポートを指定
PORT=8080 npm start
```

## 推奨デプロイ順序

1. **ローカルテスト**: `npm start` で動作確認
2. **Render.com**: 最も安定した無料オプション
3. **Heroku**: 実績のあるプラットフォーム
4. **Railway**: シンプルだが制限あり
5. **Vercel**: 認証問題が解決できる場合

これでPlaywrightツールが完全にクラウドAPIとして動作します！