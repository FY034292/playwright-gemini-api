FROM node:18-alpine

# Playwrightの依存関係をインストール
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# Playwrightブラウザをインストール
RUN npx playwright install chromium

# アプリケーションコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "server.js"]