const { chromium } = require('playwright');

async function runTest() {
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

        await page.getByRole('textbox', { name: 'ここにプロンプトを入力してください' }).fill('こんにちわ');
        await page.getByRole('button', { name: 'プロンプトを送信' }).click();
        console.log('回答を取得中...');

        await page.locator('[data-test-id="more-menu-button"]').click();
        await page.locator('[data-test-id="copy-button"]').click();
        const copiedText = await page.evaluate(() => navigator.clipboard.readText());
    
            console.log('─'.repeat(50));
            console.log(copiedText);
            console.log('─'.repeat(50));

    } catch (error) {
        console.error('テスト中にエラーが発生しました:', error);
    } finally {
        await browser.close();
        console.log('ブラウザを閉じました');
    }
}

// テストを実行
runTest().catch(console.error);
