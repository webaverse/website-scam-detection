import fs from 'fs';
import puppeteer from 'puppeteer';

// read the contexts of urls_to_watch.txt into an array
const urls_to_watch = fs.readFileSync('urls_to_watch.txt', 'utf8').split('\n');

console.log('urls_to_watch: ', urls_to_watch);

// make a new instance of puppeteer
const browser = await puppeteer.launch({
    headless: true
});

console.log('started browser')

async function scanWebsite(url){
    try {
        const page = await browser.newPage();
        await page.goto('https://' + url);
        await page.screenshot({ path: 'screenshots/' + url + '.png' });
        console.log('screenshotted ', url);
        await page.close();
    } catch (err) {
        console.log('could not screenshot', url, 'trying www...');
        try {
            const page = await browser.newPage();
            await page.goto('https://www.' + url);
            await page.screenshot({ path: 'screenshots/www.' + url + '.png' });
            console.log('screenshotted ', url);
            await page.close();
        } catch (err) {
            console.log('could not screenshoot ', url);
        }
    }
}

async function scanWebsites() {
    console.log('scanning websites');
    // for each url in urls_to_watch... use puppeteer to take a screenshot of the url and save it to a file
    for (const url of urls_to_watch) {
        await scanWebsite(url);
    }
}
scanWebsites();
// call scanWebsites() once and then once every hour after that
setInterval(scanWebsites, 3600000);