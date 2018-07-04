const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const statTrans = require('./statTrans');
const _ = require('lodash');

// parse application/json
app.use(bodyParser.json());

app.post('/sun/stattran', async function (req, res) {
    const trans = req.body.trans || [];
    if (trans.length === 0) {
        res.send([]);
        return;
    }
    let stats = [];
    let error = 0;
    try {
        stats = await statTrans(trans);
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
