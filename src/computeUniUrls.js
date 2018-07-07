const _ = require('lodash');
const getDistance = require('./getDistance');
const getInnerHTML = require('./getInnerHTML');
const MATCH_DISTANCE = 0.95;

function getUrlWithoutQuery(url) {
    if (url == null) {
        return null;
    }
    const sepIndex = url.indexOf('?');
    if (sepIndex < 0) {
        return url;
    }

    return url.slice(0, sepIndex);
}

function pickUrls(urls) {
    if (urls == null) {
        return [];
    }
    const shuffledUrls = _.chain(urls).uniq().shuffle().value();
    const pickedUrls = shuffledUrls.slice(0, Math.min(3, shuffledUrls.length));

    return pickedUrls;
}

async function computeUniUrls(urls) {
    if (urls == null) {
        return {
            error: 1,
            errorMessage: `[computeUniUrls] urls is undefined`
        }
    }
    const containsNullElement = _.some(urls => (url == null));
    if (containsNullElement) {
        return {
            error: 1,
            errorMessage: `[computeUniUrls] urls contains null element`
        }
    }

    if (urls.length <= 1) {
        return {
            error: 0,
            data: {
                uniurls: urls,
                undeterminedUrls: []
            }
        };
    }

    try {
        const uniUrls = [];
        const undeterminedUrls = [];
        const groupedUrls = _.groupBy(urls, getUrlWithoutQuery);
        const candidates = Object.keys(groupedUrls);

        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const urlsTobeVerified = groupedUrls[candidate];
            const pickedUrls = pickUrls(urlsTobeVerified);

            const baseResp = await getInnerHTML(candidate);
            if (baseResp.error) {
                return baseResp;
            }
            const baseHtml = baseResp.data.innerHTML;
            const htmls = [];
            for (let j = 0; j < pickedUrls.length; j++) {
                const resp = await getInnerHTML(pickedUrls[j]);
                if (resp.error) {
                    return resp;
                }
                htmls.push(resp.data.innerHTML);
            }

            const distances = [];
            for (let j = 0; j < htmls.length; j++) {
                const resp = await getDistance(baseHtml, htmls[j]);
                if (resp.error) {
                    return resp;
                }
                distances.push(resp.data.distance);
            }
            console.log(distances);
            const match = _.every(distances, distance => (distance >= MATCH_DISTANCE));
            if (match) {
                uniUrls.push(candidate);
            } else {
                undeterminedUrls.push(...urlsTobeVerified);
            }
        }
        return {
            error: 0,
            data: {uniUrls, undeterminedUrls}
        }
    } catch (error) {
        return {
            error: 1,
            errorMessage: `[computeUniUrls] process error, error = ${error}`
        };
    }
}

module.exports = computeUniUrls;
