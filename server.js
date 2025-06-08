const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = process.env.PORT || 3000;

// ブラウザとページの永続化
let browser = null;
let page = null;
let isInitialized = false;

// アイドルタイムアウト設定（5分）
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5分
let lastRequestTime = Date.now();
let idleTimer = null;

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

// アイドルタイマーのリセット
function resetIdleTimer() {
    lastRequestTime = Date.now();

    if (idleTimer) {
        clearTimeout(idleTimer);
    }

    idleTimer = setTimeout(async () => {
        console.log('アイドルタイムアウト（5分）: ブラウザを閉じます');
        await closeBrowser();
    }, IDLE_TIMEOUT);
}

async function initializeBrowser() {
    if (isInitialized && browser && page) {
        return { browser, page };
    }

    try {
        browser = await chromium.launch({
            headless: true,
            slowMo: 100,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--lang=ja-JP',
                '--accept-lang=ja-JP'
            ]
        });

        const context = await browser.newContext({
            locale: 'ja-JP',
            timezoneId: 'Asia/Tokyo',
            permissions: ['clipboard-read', 'clipboard-write'],
            extraHTTPHeaders: {
                'Accept-Language': 'ja-JP,ja;q=0.9'
            }
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

        // プロンプト送信前の「その他」ボタン数を取得
        const moreButtons = page.locator('[data-test-id="more-menu-button"]');
        const initialButtonCount = await moreButtons.count();

        await page.getByRole('textbox', { name: 'ここにプロンプトを入力してください' }).fill(prompt);
        await page.getByRole('button', { name: 'プロンプトを送信' }).click();

        // MutationObserverを使用したリアルタイム応答監視
        console.log('新しい応答の生成完了を待機中...');

        const finalButtonCount = await page.evaluate(async (initialCount) => {
            return new Promise((resolve, reject) => {
                const maxWaitTime = 60000; // 60秒
                let observer;
                
                // タイムアウト設定
                const timeout = setTimeout(() => {
                    if (observer) observer.disconnect();
                    reject(new Error('新しい応答のボタンが表示されませんでした（タイムアウト）'));
                }, maxWaitTime);

                try {
                    // MutationObserverの設定
                    observer = new MutationObserver((mutations) => {
                        try {
                            mutations.forEach((mutation) => {
                                // 新しく追加されたノードをチェック
                                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                    const currentButtons = document.querySelectorAll('[data-test-id="more-menu-button"]');
                                    const currentCount = currentButtons.length;
                                    
                                    // 新しいボタンが追加された場合
                                    if (currentCount > initialCount) {
                                        // DOM安定化待機
                                        setTimeout(() => {
                                            const finalCount = document.querySelectorAll('[data-test-id="more-menu-button"]').length;
                                            if (finalCount > initialCount) {
                                                clearTimeout(timeout);
                                                observer.disconnect();
                                                resolve(finalCount);
                                            }
                                        }, 500);
                                    }
                                }
                            });
                        } catch (error) {
                            clearTimeout(timeout);
                            observer.disconnect();
                            reject(error);
                        }
                    });

                    // 監視設定
                    const config = {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['data-test-id', 'class']
                    };

                    // 監視開始
                    observer.observe(document.body, config);
                    
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
        }, initialButtonCount);

        if (finalButtonCount === 0) {
            throw new Error('「その他」ボタンが見つかりません');
        }

        // 最後（最新）の「その他」ボタンをクリック
        await moreButtons.nth(finalButtonCount - 1).click();
        await page.locator('[data-test-id="copy-button"]').click();
        const copiedText = await page.evaluate(() => navigator.clipboard.readText());

        console.log('─'.repeat(50));
        console.log(copiedText);
        console.log('─'.repeat(50));

        return copiedText;

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
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
    resetIdleTimer(); // リクエスト時にタイマーリセット

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