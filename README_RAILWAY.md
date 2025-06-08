# Playwright Gemini API - Railway Version

PlaywrightでGeminiを自動化するAPIをRailwayにデプロイする版

## 認証問題の解決

Vercelでパスワード保護が強制される問題を回避するため、Railway（無料クラウドプラットフォーム）版を作成しました。

## ファイル構成

```
.
├── server.js               # Express サーバー（Railway用）
├── Dockerfile             # Docker設定（Railway用）
├── api/
│   └── gemini-automation.js # Vercel版API関数
├── package.json            # 依存関係（Express追加済み）
├── vercel.json            # Vercel設定
├── README.md              # Vercel版ガイド
├── README_RAILWAY.md      # この Railway版ガイド
├── test-api.js           # APIテストツール
└── index.js              # 元のローカル実行ファイル
```

## Railway デプロイ手順

### 1. Railway アカウント作成
1. https://railway.app にアクセス
2. GitHubアカウントでサインアップ（無料）

### 2. GitHubリポジトリに Push
```bash
# Gitリポジトリを初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: Playwright Gemini API"

# GitHubリポジトリを作成してpush
# （GitHubで新しいリポジトリを作成後）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Railway でデプロイ
1. Railway ダッシュボードで「New Project」をクリック
2. 「Deploy from GitHub repo」を選択
3. 作成したリポジトリを選択
4. Railwayが自動的にDockerfileを検出してデプロイ開始
5. デプロイ完了後、URLが提供される

### 4. 環境変数設定（必要に応じて）
Railway ダッシュボードで以下の環境変数を設定可能：
- `PORT`: 3000（デフォルト）
- その他カスタム設定

## ローカルテスト

```bash
# Express サーバーを起動
npm start

# 別ターミナルでテスト
curl -X POST http://localhost:3000/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "こんにちは"}'
```

## API エンドポイント

### ヘルスチェック
```
GET https://your-app.railway.app/
```

### Gemini 自動化
```
POST https://your-app.railway.app/api/gemini-automation
```

### リクエスト例
```bash
curl -X POST https://your-app.railway.app/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "今日の天気はどうですか？"}'
```

### レスポンス例
```json
{
  "success": true,
  "prompt": "今日の天気はどうですか？",
  "response": "Geminiからの回答テキスト",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 他のプラットフォーム

### Render.com
1. https://render.com でアカウント作成
2. 「New Web Service」でリポジトリを接続
3. Build Command: `npm install`
4. Start Command: `npm start`

### Heroku
```bash
# Heroku CLI インストール後
heroku create your-app-name
git push heroku main
```

## トラブルシューティング

### Dockerビルドエラー
- Playwrightの依存関係が正しくインストールされているか確認
- Dockerfileのnode:18-alpineイメージを使用

### ブラウザ起動エラー
- `--no-sandbox`、`--disable-setuid-sandbox` フラグが設定されているか確認
- メモリ制限の確認

### タイムアウトエラー
- 無料プランの制限を確認
- 必要に応じて待機時間を調整

## Railway の利点

- 🆓 **無料枠**: 月500時間の実行時間
- 🚀 **簡単デプロイ**: GitHubリポジトリから自動デプロイ
- 🔒 **認証問題なし**: Vercelのような強制認証がない
- 🐳 **Docker対応**: Dockerfileで完全に制御可能
- 📊 **モニタリング**: ログとメトリクスの監視

これでPlaywrightツールがクラウドAPIとして正常に動作します！