const puppeteer = require('puppeteer');
const _ = require('lodash');

function validateTran(tran) {
    if (tran == null) {
        throw new Error('tran is null');
    }
    const {fxurl, type, xpath, transtype} = tran;
    if (fxurl == null || type == null || xpath == null) {
        throw new Error(`fxurl, type, xpath, transtype is required, tran = ${JSON.stringify(tran)}`);
    }
}

function validateTrans(trans) {
    if (trans == null || !Array.isArray(trans)) {
        throw new Error('trans must be array type');
    }
    _.forEach(trans, tran => {
        validateTran(tran);
    });
}

function delay10Secs() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, 10000);
    });
}

async function statTrans(trans) {
    validateTrans(trans);
    if (trans.length === 0) {
        return []
    }
    const result = [];
    const groupedTrans = _.groupBy(trans, tran => tran.fxurl);
    const urls = Object.keys(groupedTrans);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        devtools: false
    });
    const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36';
    const page = await browser.newPage();
    page.setUserAgent(userAgent);
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        let isPageFullLoaded = true;
        try {
            await page.goto(url, {
                timeout: 30 * 1000,
                waitUntil: 'networkidle2',
            });
        } catch (ex) {
            isPageFullLoaded = false;
        }
        // await delay10Secs();

        const transOfUrl = groupedTrans[url] || [];
        for (let j = 0; j < transOfUrl.length; j++) {
            const tran = transOfUrl[j];
            let stats = null;
            try {
                stats = await page.evaluate(function (tran) {
                    const isSDKInstalled = !!(window._agl && window._agl.isAngelia);
                    let matchedStatus = 'unknown';
                    const {type, xpath, transtype} = tran;
                        // domid
                    if (type === 1) {
                        const node = document.getElementById(xpath);
                        matchedStatus = node == null ? 'not_match' : 'match';
                    } else if (type === 0) { // xpath
                        function isMatch(root, xpath) {
                            const parts = xpath.split('>');
                            const regx = /(.+)\[(\d+)\](?:\[@id="(.+)"\])?/;

                            function queryNode(parent, part) {
                                const matches = part.match(regx);
                                const tag = matches[1];
                                const index = matches[2];
                                if (tag == null || index == null) {
                                    return null;
                                }
                                const id = matches[3];
                                const candidateNodes = parent.querySelectorAll(`:scope>${tag}`) || [];
                                const candidateNode = candidateNodes[(Number(index) - 1)];
                                if (candidateNode == null) {
                                    return null;
                                }
                                if (id && candidateNode.id !== id) {
                                    return null;
                                }
                                return candidateNode;
                            }
                            let node = root;
                            for(let i = 0; i < parts.length && node; i++) {
                                node = queryNode(node, parts[i]);
                            }
                            return node != null;
                        }
                        matchedStatus = isMatch(window.document, xpath) ? 'match' : 'not_match';
                    } else if (type === 2) { // callback
                        matchedStatus = isSDKInstalled ? 'match' : 'not_match';
                    } else if (type === 3) {

                    }
                    return {matchedStatus, isSDKInstalled};
                }, tran);
            } catch (ex) {
                // ignore
            }
            result.push({
                ...tran,
                ...stats,
                isPageFullLoaded
            })
        }
    }
    await browser.close();
    return result;
}

async function statUrls(urls) {
    if (!urls || urls.length === 0) {
        return []
    }
    const result = [];
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        devtools: false
    });
    const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36';
    const page = await browser.newPage();
    page.setUserAgent(userAgent);
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        let isPageFullLoaded = true;
        try {
            await page.goto(url, {
                timeout: 5 * 1000,
                // waitUntil: 'networkidle2',
            });
        } catch (ex) {
            isPageFullLoaded = false;
        }
        // await delay10Secs();
        let info = {
            isSdkInstalled: false,
            isFenghuaJs: false
        };
        try {
            info = await page.evaluate(function () {
                var isSdkInstalled = !!(window._agl && window._agl.isAngelia);
                var isFenghuaJs = !!(window._bdSiteStatConf && window._bdSiteStatConf.guid);
                return {
                    isFenghuaJs: isFenghuaJs,
                    isSdkInstalled: isSdkInstalled
                };
            });
        } catch (ex) {
            // ignore
        }
        result.push({
            url,
            ...info,
            isPageFullLoaded
        })
    }
    await browser.close();
    return result;
}

module.exports = {
    statTrans,
    statUrls
};
