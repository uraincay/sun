const request = require('request');
const {moonHost, moonPort} = require('yargs').argv;
const getInnerHTML = require('./getInnerHTML');

if (moonHost == null) {
    throw new Error('moon host is not specified!');
}

async function getDistance(html1, html2) {
    const options = {
        url: `http://${moonHost}:${moonPort}/moon/html/consine/distance`,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({html1, html2})
    };
    return new Promise(resolve => {
        request(options, (error, response, body) => {
            if (error) {
                return resolve({
                    error: 1,
                    errorMessage: JSON.stringify(error)
                });
            }

            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                return resolve({
                    error: 1,
                    errorMessage: JSON.stringify(e)
                });
            }
            resolve({
                error: 0,
                data
            });
        });
    });
}

async function getUrlsDistance(url1, url2) {
    const [resp1, resp2] = await Promise.all([getInnerHTML(url1), getInnerHTML(url2)]);
    if (resp1.error || resp2.error) {
        return {
            error: 1,
            errorMessage: `[getUrlsDistance] (url1=${url1}, url2=${url2}) url1(${resp1.errorMessage}), url2(${resp2.errorMessage})`
        }
    }
    try {
        const innerHTML1 = resp1.data.innerHTML;
        const innerHTML2 = resp2.data.innerHTML;
        const {error, errorMessage, data} = await getDistance(innerHTML1, innerHTML2);
        if (error) {
            return {
                error: 1,
                errorMessage: `[getUrlsDistance] (url1=${url1}, url2=${url2}) getDistance error, error = ${errorMessage}`
            };
        }
        const distance = data.distance || 0;
        return {
            error: 0,
            data: {distance}
        };
    } catch (ex) {
        return {
            error: 1,
            errorMessage: `[getUrlsDistance] (url1=${url1}, url2=${url2}) process error, error = ${ex}`
        }
    }
}

module.exports = {getUrlsDistance};
