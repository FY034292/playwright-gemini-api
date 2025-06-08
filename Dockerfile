# ================================================
# Playwright Gemini API - 最適化Dockerfile
# ================================================
# 
# 特徴:
# - Playwright公式イメージ使用（ブラウザプリインストール）
# - マルチステージビルドで効率化
# - セキュリティ向上（non-rootユーザー）
# - Dockerレイヤーキャッシュ最適化
# ================================================

# ステージ1: 依存関係ビルド
FROM mcr.microsoft.com/playwright:v1.52.0-jammy as dependencies

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー（キャッシュ効率化）
COPY package*.json ./

# 依存関係をインストール（本番用のみ）
RUN npm ci --only=production && npm cache clean --force

# ステージ2: 本番イメージ
FROM mcr.microsoft.com/playwright:v1.52.0-jammy as production

WORKDIR /app

# curlをインストール（ヘルスチェック用）
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 依存関係を前のステージからコピー（効率化）
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# アプリケーションコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# セキュリティ向上: root以外のユーザーを作成
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# playwrightユーザーで実行
USER playwright

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# アプリケーションを起動
CMD ["node", "server.js"]
