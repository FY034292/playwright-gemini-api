# Playwright Gemini API

PlaywrightでGeminiを自動化するVercel APIエンドポイント

## 概要

このプロジェクトは、Google Geminiに自動でアクセスし、プロンプトを送信して回答を取得するAPIです。VercelのServerless Functionsを使用して無料でデプロイできます。

## 機能

- HTTP POST リクエストでプロンプトを送信
- Geminiからの回答を自動取得
- JSON形式でレスポンス返却
- CORS対応
- エラーハンドリング

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ローカル開発環境での実行

```bash
npm run dev
```

### 3. Vercelへのデプロイ

#### 初回デプロイ
1. Vercelアカウントを作成
2. VercelCLIをインストール:
   ```bash
   npm install -g vercel
   ```
3. ログイン:
   ```bash
   vercel login
   ```
4. デプロイ:
   ```bash
   npm run deploy
   ```

#### 更新デプロイ
```bash
vercel
```

## API使用方法

### エンドポイント
```
POST https://your-app.vercel.app/api/gemini-automation
```

### リクエスト形式

```bash
curl -X POST https://your-app.vercel.app/api/gemini-automation \
  -H "Content-Type: application/json" \
  -d '{"prompt": "こんにちは、今日の天気はどうですか？"}'
```

### レスポンス形式

#### 成功時
```json
{
  "success": true,
  "prompt": "こんにちは、今日の天気はどうですか？",
  "response": "Geminiからの回答テキスト",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### エラー時
```json
{
  "success": false,
  "error": "エラータイプ",
  "message": "エラーメッセージ",
  "details": "詳細なエラー情報"
}
```

## 制限事項

- プロンプトは1000文字以内
- POSTメソッドのみ対応
- 実行時間は30秒以内（Vercel制限）
- Geminiサイトの仕様変更により動作しなくなる可能性があります

## トラブルシューティング

### よくある問題

1. **Geminiサイトの要素が見つからない**
   - サイトのUIが変更された可能性があります
   - セレクタを更新してください

2. **タイムアウトエラー**
   - ネットワークが遅い場合があります
   - 待機時間を調整してください

3. **クリップボードアクセスエラー**
   - ブラウザの権限設定を確認してください

## ファイル構成

```
.
├── api/
│   └── gemini-automation.js  # メインAPI関数
├── index.js                  # ローカル実行用（元のファイル）
├── package.json              # 依存関係とスクリプト
├── vercel.json              # Vercel設定
└── README.md                # このファイル
```

## 注意事項

- このツールは教育・研究目的で作成されています
- Geminiの利用規約を遵守してください
- 大量のリクエストは避けてください
- 個人情報や機密情報は送信しないでください