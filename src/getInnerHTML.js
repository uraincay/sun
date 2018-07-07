const puppeteer = require('puppeteer');
const {dev} = require('yargs').argv;

async function getInnerHTML(url) {
    if (url == null) {
        return {
            error: 1,
            errorMessage: '[getInnerHTML] url is undefined'
        };
    }
    try {
        const options = {
            args: ['--no-sandbox'],
            devtools: false
        };
        if (dev) {
            options.executablePath = '/private/var/folders/nx/4sz68b097qb7bvm0qw7nk_940000gn/T/AppTranslocation/E1CAB6DE-B329-4779-A2FB-0673548DAA32/d/Chromium.app/Contents/MacOS/Chromium';
        }
        const browser = await puppeteer.launch(options);
        const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36';
        const page = await browser.newPage();
        page.setUserAgent(userAgent);
        try {
            await page.goto(url, {
                timeout: 30 * 1000,
                waitUntil: 'networkidle2',
            });
        } catch (error) {
            await browser.close();
            return {
                error: 1,
                errorMessage: `[getInnerHTML] page is not opened, url = ${url}, error=${error}`
            }
        }

        let innerHTML;
        try {
            innerHTML = await page.evaluate(function () {
                return (document.body.innerHTML || '');
            });
        } catch (error) {
            await browser.close();
            return {
                error: 1,
                errorMessage: `[getInnerHTML] page evaluate error, url = ${url}, error=${error}`
            }
        }
        await browser.close();
        return {
            error: 0,
            data: {innerHTML}
        };
    } catch (error) {
        return {
            error: 1,
            errorMessage: `[getInnerHTML] process error, error = ${error}`
        };
    }
}

module.exports = getInnerHTML;
