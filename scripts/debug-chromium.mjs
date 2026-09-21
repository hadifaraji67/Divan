import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';

const executablePath = '/data/data/com.termux/files/usr/bin/chromium-browser';

if (!existsSync(executablePath)) {
  console.error('❌ Chromium نیست');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote'],
});

const page = await browser.newPage();
await page.setViewport({ width: 400, height: 850, deviceScaleFactor: 2 });

console.log('\n📱 بارگذاری http://localhost:8080...');
await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));

const info = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  rootExists: !!document.getElementById('root'),
  rootChildren: document.getElementById('root')?.children.length || 0,
  rootHTML: document.getElementById('root')?.innerHTML.slice(0, 500) || '',
  bodyText: document.body.innerText.slice(0, 300),
  hasLoadingSpinner: document.body.innerHTML.includes('animate-spin'),
  hasError: document.body.innerHTML.includes('خطا') || document.body.innerHTML.includes('Error'),
}));

console.log('\n📊 محتوای صفحه:');
console.log('Title:        ', info.title);
console.log('URL:          ', info.url);
console.log('#root exists: ', info.rootExists);
console.log('#root children:', info.rootChildren);
console.log('Has spinner:  ', info.hasLoadingSpinner);
console.log('Has error:    ', info.hasError);
console.log('\nBody text (300 char):');
console.log('---');
console.log(info.bodyText);
console.log('---');
console.log('\n#root HTML (500 char):');
console.log('---');
console.log(info.rootHTML);
console.log('---');

// اسکرین‌شات تست با نام debug
await page.screenshot({ path: 'screenshots/debug-chromium.png' });
const size = (await import('node:fs')).statSync('screenshots/debug-chromium.png').size;
console.log(`\n✅ debug-chromium.png (${size} bytes)`);

await browser.close();
