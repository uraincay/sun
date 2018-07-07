const request = require('request');
const {moonHost, moonPort} = require('yargs').argv;

if (moonHost == null) {
    throw new Error('moon host is not specified!');
}

async function getDistance(html1, html2) {
    if (html1 == null || html2 == null) {
        return {
            error: 1,
            errorMessage: `[getDistance] html1 or html2 is undefined`
        };
    }
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
                    errorMessage: `[getDistance] request error, error = ${error}`
                });
            }
            try {
                const data = JSON.parse(body);
                resolve({
                    error: 0,
                    data
                });
            } catch (error) {
                return resolve({
                    error: 1,
                    errorMessage: `[getDistance] process error, error = ${error}`
                });
            }
        });
    });
}

module.exports = getDistance;
