const { chromium } = require('playwright');

async function testPlaywright() {
  console.log('🧪 Testing Playwright...');
  
  try {
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({ headless: true });
    console.log('✅ Browser launched!');
    
    console.log('📄 Creating page...');
    const page = await browser.newPage();
    console.log('✅ Page created!');
    
    console.log('🔗 Navigating to example.com...');
    await page.goto('https://example.com');
    console.log('✅ Navigation successful!');
    
    const title = await page.title();
    console.log('📝 Page title:', title);
    
    console.log('🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed!');
    
    console.log('\n✅✅✅ Playwright is working! ✅✅✅\n');
  } catch (error) {
    console.error('\n❌❌❌ Playwright test failed! ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testPlaywright();
