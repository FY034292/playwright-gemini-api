# Playwright Gemini API

PlaywrightでGeminiを自動化するクラウドAPIエンドポイント

## 🚀 デプロイ済みAPI

**Live API URL**: https://mundane-beetle-production.up.railway.app

## 📡 API エンドポイント

### ヘルスチェック
```
GET /
```

### Gemini自動化
```
POST /api/gemini-automation
```

## 💻 使用例

```bash
# ヘルスチェック
curl https://mundane-beetle-production.up.railway.app/

# Geminiに質問
curl -X POST https://mundane-beetle-production.up.railway.app/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "今日の天気はどうですか？"}'
```

### レスポンス例
```json
{
  "success": true,
  "prompt": "今日の天気はどうですか？",
  "response": "Geminiからの回答テキスト",
  "timestamp": "2025-06-08T15:07:51.813Z"
}
```

## 🛠️ ローカル開発

```bash
# 依存関係をインストール
npm install

# サーバーを起動
npm start

# ローカルでテスト
curl -X POST http://localhost:3000/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "こんにちは"}'
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

## ⚠️ 注意事項

- このツールは教育・研究目的で作成されています
- Geminiの利用規約を遵守してください
- 大量のリクエストは避けてください
- 個人情報や機密情報は送信しないでください

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
- **ブラウザ自動化**: Playwright (Chromium)
- **デプロイ**: Railway (Docker)
- **Node.js**: v18
- **OS**: Ubuntu Slim

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**GitHub Repository**: https://github.com/FY034292/playwright-gemini-api