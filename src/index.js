const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const statistic = require('./statistic');
const _ = require('lodash');
const getUniurls = require('./getUniurls');


// parse application/json
app.use(bodyParser.json());

app.post('/sun/uniurls', async function (req, res) {
    try {
        const urls = req.body.urls || [];
        const result = await getUniurls(urls);
        res.send(result);
    } catch (ex) {
        res.send({
            error: 1,
            errorMessage: `[/sun/uniurls] process error, error = ${ex}`
        })
    }
});

app.post('/sun/stattrans', async function (req, res) {
    const trans = req.body.trans || [];
    if (trans.length === 0) {
        res.send([]);
        return;
    }
    let stats = [];
    let error = 0;
    try {
        stats = await statistic.statTrans(trans);
    } catch (ex) {
        error = 1;
    }
    res.send({
        data: {stats},
        error
    });
});

app.post('/sun/staturls', async function (req, res) {
    const urls = req.body.urls || [];
    if (urls.length === 0) {
        res.send([]);
        return;
    }
    let stats = [];
    let error = 0;
    try {
        stats = await statistic.statUrls(urls);
    } catch (ex) {
        error = 1;
    }
    res.send({
        data: {stats},
        error
    });
});


app.listen(3000, function () {
    console.log('alltrans app listening on port 3000!');
});
