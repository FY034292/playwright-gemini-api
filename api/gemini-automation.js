const { chromium } = require('playwright');

async function runGeminiAutomation(prompt) {
    const browser = await chromium.launch({
        headless: true,  
        slowMo: 1000,  
    });

    const context = await browser.newContext({
        locale: 'ja-JP', 
        permissions: ['clipboard-read', 'clipboard-write']  
    });
    const page = await context.newPage();

    try {
        await page.goto('https://gemini.google.com/app');
        console.log('ページにアクセスしました');

        await page.getByRole('textbox', { name: 'ここにプロンプトを入力してください' }).fill(prompt);
        await page.getByRole('button', { name: 'プロンプトを送信' }).click();
        console.log('回答を取得中...');

        // 応答を待つ
        await page.waitForTimeout(5000);

        await page.locator('[data-test-id="more-menu-button"]').click();
        await page.locator('[data-test-id="copy-button"]').click();
        const copiedText = await page.evaluate(() => navigator.clipboard.readText());
    
        console.log('─'.repeat(50));
        console.log(copiedText);
        console.log('─'.repeat(50));

        return copiedText;

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
        throw error;
    } finally {
        await browser.close();
        console.log('ブラウザを閉じました');
    }
}

export default async function handler(req, res) {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONSリクエスト（プリフライト）への対応
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POSTメソッドのみ許可
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'POSTメソッドのみサポートしています'
        });
    }

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
}