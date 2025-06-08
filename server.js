const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = process.env.PORT || 3000;

// ブラウザとページの永続化
let browser = null;
let page = null;
let isInitialized = false;

app.use(express.json());

// CORS設定
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

async function initializeBrowser() {
    if (isInitialized && browser && page) {
        return { browser, page };
    }

    try {
        browser = await chromium.launch({
            headless: true,
            slowMo: 1000,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const context = await browser.newContext({
            locale: 'ja-JP',
            permissions: ['clipboard-read', 'clipboard-write']
        });
        page = await context.newPage();

        await page.goto('https://gemini.google.com/app');
        console.log('ページにアクセスしました');

        isInitialized = true;
        return { browser, page };
    } catch (error) {
        console.error('ブラウザの初期化中にエラーが発生しました:', error);
        throw error;
    }
}

async function runGeminiAutomation(prompt) {
    try {
        // ブラウザが初期化されていない場合は初期化
        const { page } = await initializeBrowser();

        await page.getByRole('textbox', { name: 'ここにプロンプトを入力してください' }).fill(prompt);
        await page.getByRole('button', { name: 'プロンプトを送信' }).click();
        console.log('回答を取得中...');

        // 応答を待つ
        await page.waitForTimeout(5000);

        // 最新の回答の「その他」ボタンを特定（最後の要素を選択）
        const moreButtons = page.locator('[data-test-id="more-menu-button"]');
        const buttonCount = await moreButtons.count();

        if (buttonCount === 0) {
            throw new Error('「その他」ボタンが見つかりません');
        }

        // 最後（最新）の「その他」ボタンをクリック
        await moreButtons.nth(buttonCount - 1).click();
        await page.locator('[data-test-id="copy-button"]').click();
        const copiedText = await page.evaluate(() => navigator.clipboard.readText());

        console.log('─'.repeat(50));
        console.log(copiedText);
        console.log('─'.repeat(50));

        return copiedText;

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        // エラーが発生した場合はブラウザを再初期化
        await closeBrowser();
        throw error;
    }
}

async function closeBrowser() {
    try {
        if (browser) {
            await browser.close();
            console.log('ブラウザを閉じました');
        }
    } catch (error) {
        console.error('ブラウザクローズ中にエラー:', error);
    } finally {
        browser = null;
        page = null;
        isInitialized = false;
    }
}

// プロセス終了時にブラウザをクリーンアップ
process.on('SIGINT', async () => {
    console.log('サーバーを終了します...');
    await closeBrowser();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('サーバーを終了します...');
    await closeBrowser();
    process.exit(0);
});

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Gemini Automation API is running',
        browserStatus: isInitialized ? 'initialized' : 'not initialized',
        endpoints: {
            automation: 'POST /api/gemini-automation',
            closeBrowser: 'POST /api/close-browser'
        }
    });
});

// メインAPIエンドポイント
app.post('/api/gemini-automation', async (req, res) => {
    try {
        const { prompt } = req.body;

        // プロンプトの検証
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                error: 'Invalid prompt',
                message: 'プロンプトは文字列である必要があります'
            });
        }

        if (prompt.length > 1000) {
            return res.status(400).json({
                error: 'Prompt too long',
                message: 'プロンプトは1000文字以内にしてください'
            });
        }

        console.log(`プロンプトを受信: ${prompt}`);

        // Gemini自動化実行
        const result = await runGeminiAutomation(prompt);

        return res.status(200).json({
            success: true,
            prompt: prompt,
            response: result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API エラー:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Geminiの自動化処理中にエラーが発生しました',
            details: error.message
        });
    }
});

// ブラウザを手動で閉じるエンドポイント
app.post('/api/close-browser', async (req, res) => {
    try {
        await closeBrowser();
        return res.status(200).json({
            success: true,
            message: 'ブラウザを閉じました'
        });
    } catch (error) {
        console.error('ブラウザクローズエラー:', error);
        return res.status(500).json({
            success: false,
            error: 'ブラウザクローズエラー',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});