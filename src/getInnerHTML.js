const puppeteer = require('puppeteer');

async function getInnerHTML(url) {
    if (url == null) {
        return {
            error: 1,
            errorMessage: 'url is undefined'
        };
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        devtools: false
    });
    const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36';
    const page = await browser.newPage();
    page.setUserAgent(userAgent);

    try {
        await page.goto(url, {
            timeout: 30 * 1000,
            waitUntil: 'networkidle2',
        });
    } catch (ex) {
        await browser.close();
        return {
            error: 1,
            errorMessage: `page is not opened, url = ${url}, error=${err}`
        }
    }

    let innerHTML;
    try {
        innerHTML = await page.evaluate(function () {
            return (document.body.innerHTML || '');
        });
    } catch (ex) {
        await browser.close();
        return {
            error: 1,
            errorMessage: `page is evaluate error, url = ${url}, error=${ex}`
        }
    }
    await browser.close();
    return {
        error: 0,
        data: {innerHTML}
    };
}

module.exports = getInnerHTML;
