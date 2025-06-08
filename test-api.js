// ローカルまたはデプロイ済みAPIをテストするためのサンプル
const testPrompts = [
    "こんにちは",
    "今日の天気はどうですか？",
    "JavaScriptの基本的な使い方を教えてください"
];

async function testAPI(baseUrl, prompt) {
    try {
        console.log(`\n🔄 テスト実行: "${prompt}"`);
        console.log(`📡 送信先: ${baseUrl}/api/gemini-automation`);
        
        const response = await fetch(`${baseUrl}/api/gemini-automation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ 成功:');
            console.log(`📝 プロンプト: ${data.prompt}`);
            console.log(`🤖 Gemini回答: ${data.response}`);
            console.log(`⏰ 実行時刻: ${data.timestamp}`);
        } else {
            console.log('❌ エラー:');
            console.log(`🚫 ステータス: ${response.status}`);
            console.log(`📄 メッセージ: ${data.message}`);
            console.log(`🔍 詳細: ${data.details || 'なし'}`);
        }
        
        console.log('─'.repeat(80));

    } catch (error) {
        console.error('❌ ネットワークエラー:', error.message);
        console.log('─'.repeat(80));
    }
}

async function runTests() {
    // デプロイ先URLを設定（デプロイ後に更新してください）
    const BASE_URL = "https://gemini-mwq370gsn-fy034292s-projects.vercel.app/";
    
    console.log('🚀 Gemini API テスト開始');
    console.log(`🌐 ベースURL: ${BASE_URL}`);
    console.log('=' .repeat(80));

    for (const prompt of testPrompts) {
        await testAPI(BASE_URL, prompt);
        // APIレート制限を避けるために少し待機
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✨ 全テスト完了');
}

// エラー時のプロンプト検証テスト
async function testValidation() {
    const BASE_URL = process.env.API_URL || 'http://localhost:3000';
    
    console.log('\n🔍 バリデーションテスト開始');
    
    // 空のプロンプト
    await testAPI(BASE_URL, '');
    
    // 長すぎるプロンプト
    const longPrompt = 'あ'.repeat(1001);
    await testAPI(BASE_URL, longPrompt);
    
    // 数値プロンプト（型エラー）
    try {
        const response = await fetch(`${BASE_URL}/api/gemini-automation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: 123 })
        });
        const data = await response.json();
        console.log('📊 数値プロンプトテスト:', data);
    } catch (error) {
        console.error('❌ 数値プロンプトテストエラー:', error.message);
    }
}

// 使用例
if (require.main === module) {
    console.log('使用方法:');
    console.log('1. 基本テスト: node test-api.js');
    console.log('2. カスタムURL: API_URL=https://your-app.vercel.app node test-api.js');
    console.log('3. バリデーションテスト: node test-api.js validation');
    
    const command = process.argv[2];
    
    if (command === 'validation') {
        testValidation();
    } else {
        runTests();
    }
}

module.exports = { testAPI, runTests, testValidation };