import puppeteer from 'puppeteer';
import http from 'http'
import fs from 'fs';
import { tlds as tldsToChange } from './tlds.js';
// filter out all entries with more than 5 letters in the domain name
const tlds = tldsToChange.filter(tld => tld.length < 6);

async function detectScammers() {

    // check if input.txt exists, if it does load it into an array, otherwise load input_default.txt into an array
    const urls = fs.existsSync('input.txt') ? fs.readFileSync('input.txt', 'utf8').split('\n') : fs.readFileSync('input_default.txt', 'utf8').split('\n');
    const allUrls = [];

    const whitelistUrls = fs.existsSync('whitelist.txt') ? fs.readFileSync('whitelist.txt', 'utf8').split('\n') : fs.readFileSync('whitelist_default.txt', 'utf8').split('\n');

    const suffixes = [
        '', 's', 'r', 'd', 'z'
    ]

    // for each url, add a suffix and add to the urls array
    for (let i = 0; i < urls.length; i++) {
        for (let j = 0; j < suffixes.length; j++) {
            allUrls.push(urls[i] + suffixes[j]);
        }
    }

    console.log('urls', allUrls);

    const urlsToCheck = [];

    const urlsThatExist = [];

    // make a new instance of puppeteer
    const browser = await puppeteer.launch({
        headless: true
    });

    async function screenshotWebsite(url) {
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
                console.log('could not screenshot www.' + url);
            }
        }
    }

    // copied from 
    // https://github.com/nwaughachukwuma/url-exists-nodejs/blob/main/index.js
    async function urlExists(url) {
        if (typeof url !== 'string') {
            throw new TypeError(`Expected a string, got ${typeof url}`)
        }
        // inspired by https://github.com/sindresorhus/is-url-superb/blob/main/index.js
        function validURL(url) {
            try {
                return new URL(url.trim()) // eslint-disable-line no-new
            } catch (_e) {
                return null
            }
        }

        const valid_url = validURL(url)
        if (!valid_url) return false

        const { host, pathname } = valid_url
        const opt = {
            method: 'HEAD',
            host: host,
            path: pathname,
        }

        return await new Promise((resolve) => {
            const req = http.request(opt, (r) =>
                resolve(/4\d\d/.test(`${r.statusCode}`) === false),
            )

            req.on('error', () => resolve(false))
            req.end()
        })
    }

    // for each url in urls...
    for (const url of allUrls) {
        // remove the www and tld from the url and add to the variations on the remaining string to the urlsToCheck array
        const urlWithoutTLD = url.replace(/\.([a-z]{2,3})(?:\/|$)/, '');

        // for each tld in tlds, add a new url to urlsToCheck that is urlWithoutTLD + '.' + tld
        for (let i = 0; i < tlds.length; i++) {
            urlsToCheck.push(urlWithoutTLD + '.' + tlds[i]);
        }
    }

    // for each url in whitelistUrls, check if it exists in urlsToCheck and remove if it does
    for (const url of whitelistUrls) {
        if (urlsToCheck.includes(url)) {
            urlsToCheck.splice(urlsToCheck.indexOf(url), 1);
        }
    }

    // for each url in urls...
    for (const url of urlsToCheck) {
        // check if it exists
        const exists = await urlExists('https://' + url)
        // if it does not exist, then it is a scammer
        if (exists) {
            urlsThatExist.push(url);
            console.log('valid url: ', url);
            screenshotWebsite(url);
        }
    }

    const urlsThatExistBuffer = Buffer.from(urlsThatExist.join('\n'));

    // write urls that exist to the urls file
    fs.writeFile('urls.txt', urlsThatExistBuffer, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });

    console.log('Ran check', urlsThatExist);
}

detectScammers();
setInterval(detectScammers, 24 * 3600000); // ones a day