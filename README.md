# Playwright Gemini API

PlaywrightでGeminiを自動化するクラウドAPIエンドポイント（ブラウザ永続化対応）

## 🚀 デプロイ済みAPI

**Live API URL**: https://mundane-beetle-production.up.railway.app

## 📡 API エンドポイント

### ヘルスチェック
```
GET /
```
ブラウザの初期化状態も確認できます。

### Gemini自動化
```
POST /api/gemini-automation
```
初回リクエスト時にブラウザを起動し、2回目以降は同じブラウザセッションを再利用して高速化。

### ブラウザクローズ
```
POST /api/close-browser
```
手動でブラウザセッションを終了できます。

## 💻 使用例

### ヘルスチェック
```bash
# ブラウザの状態も確認
curl https://mundane-beetle-production.up.railway.app/
```

### 基本的な使用方法
```bash
# 初回リクエスト（ブラウザ起動 + Geminiページアクセス + プロンプト処理）
curl -X POST https://mundane-beetle-production.up.railway.app/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "今日の天気はどうですか？"}'

# 2回目以降のリクエスト（高速化：プロンプト処理のみ）
curl -X POST https://mundane-beetle-production.up.railway.app/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "日本の首都はどこですか？"}'
```

### ブラウザセッション管理
```bash
# ブラウザを手動で閉じる
curl -X POST https://mundane-beetle-production.up.railway.app/api/close-browser \
  -H "Content-Type: application/json"
```

### レスポンス例

#### ヘルスチェックレスポンス
```json
{
  "status": "ok",
  "message": "Gemini Automation API is running",
  "browserStatus": "initialized",
  "endpoints": {
    "automation": "POST /api/gemini-automation",
    "closeBrowser": "POST /api/close-browser"
  }
}
```

#### Gemini自動化レスポンス
```json
{
  "success": true,
  "prompt": "今日の天気はどうですか？",
  "response": "Geminiからの回答テキスト",
  "timestamp": "2025-06-09T15:07:51.813Z"
}
```

#### ブラウザクローズレスポンス
```json
{
  "success": true,
  "message": "ブラウザを閉じました"
}
```

## 🛠️ ローカル開発

```bash
# 依存関係をインストール
npm install

# サーバーを起動
npm start

# ローカルでテスト - 初回リクエスト
curl -X POST http://localhost:3000/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "こんにちは"}'

# ローカルでテスト - 2回目以降（高速）
curl -X POST http://localhost:3000/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "ありがとう"}'

# ブラウザ状態確認
curl http://localhost:3000/

# ブラウザセッションをクローズ
curl -X POST http://localhost:3000/api/close-browser
```

## 🐳 デプロイ

### 簡単デプロイ
```bash
# 一発でデプロイ
npm run deploy
```

### 手動デプロイ
```bash
# Railway CLIでデプロイ
railway login
railway init
railway up
```

### 初回セットアップ
1. GitHubリポジトリにpush
2. Railway.app でリポジトリを接続
3. 自動でDockerfileを検出してデプロイ

## 📝 制限事項

- プロンプトは1000文字以内
- POSTメソッドのみ対応
- Geminiサイトの仕様変更により動作しなくなる可能性があります
- ブラウザセッションは一定時間後に自動で終了する場合があります

## 🚀 パフォーマンス向上

**ブラウザ永続化により大幅高速化！**
- **初回リクエスト**: ブラウザ起動 + ページアクセス + プロンプト処理（約10-15秒）
- **2回目以降**: プロンプト処理のみ（約3-5秒）

複数の質問を連続で行う場合は、同じセッションを使い回すことで処理時間を大幅に短縮できます。

## ⚠️ 注意事項

- このツールは教育・研究目的で作成されています
- Geminiの利用規約を遵守してください
- 大量のリクエストは避けてください
- 個人情報や機密情報は送信しないでください
- ブラウザセッションは自動でクリーンアップされますが、手動で`/api/close-browser`を呼び出すことを推奨します
- エラーが発生した場合、ブラウザセッションは自動で再初期化されます

## 📁 ファイル構成

```
.
├── server.js              # Express API サーバー
├── Dockerfile             # Docker設定
├── package.json           # 依存関係
├── .gitignore             # Git除外設定
└── README.md              # このファイル
```

## 🔧 技術仕様

- **フレームワーク**: Express.js
- **ブラウザ自動化**: Playwright (Chromium) - ブラウザ永続化対応
- **デプロイ**: Railway (Docker)
- **Node.js**: v18
- **OS**: Ubuntu Slim
- **新機能**: ブラウザセッション永続化による高速化
- **自動クリーンアップ**: プロセス終了時の自動ブラウザクローズ

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**GitHub Repository**: https://github.com/FY034292/playwright-gemini-api