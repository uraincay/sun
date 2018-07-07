const _ = require('lodash');
const getUrlsDistance = require('./getUrlsDistance');
const MATCH_DISTANCE = 0.8;

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

function getRandomParis(base, arr) {
    if (arr == null || base == null) {
        return [];
    }
    const shuffles = _.chain(arr).uniq().shuffle().value();
    const picks = shuffles.slice(0, Math.max(3, shuffles.length));

    return picks.map(pick => ([base, pick]));
}

async function getUniurls(urls) {
    if (urls == null || urls.length <= 1) {
        return urls;
    }

    try {
        const uniurls = [];
        const undeterminedUrls = [];
        const groupedUrls = _.groupBy(urls, getUrlWithoutQuery);
        const candidates = Object.keys(groupedUrls);
        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            const urlsTobeVerified = groupedUrls[candidate];
            const randomPairs = getRandomParis(urlsTobeVerified);
            const distanceResults = await Promise.all(randomPairs.map(([url1, url2]) => getUrlsDistance(url1, url2)));
            const errorDistanceResults = distanceResults.filter(distanceResult => distanceResult.error);
            if (errorDistanceResults.length > 0) {
                return {
                    error: 1,
                    errorMessage: errorDistanceResults.map(errorDistanceResult => errorDistanceResult.errorMessage).join('\n')
                }
            }
            const distances = distanceResults.map(distanceResult => distanceResult.data.distance);
            const match = _.every(distances, distance => (distance >= MATCH_DISTANCE));
            if (match) {
                uniurls.push(candidate);
            } else {
                undeterminedUrls.push(...urlsTobeVerified);
            }
        }

        return {
            error: 0,
            data: {uniurls, undeterminedUrls}
        }
    } catch (ex) {
        return {
            error: 1,
            errorMessage: `[getUniurls] process error, error = ${ex}`
        };
    }
}

module.exports = getUniurls;
