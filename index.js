const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    console.log('GET: /webhook');
    const VERIFY = process.env.VERIFY;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode==='subscribe' && token === VERIFY) {
        return res.status(200).send(challenge);
    }
    else {
        return res.sendStatus(403);
    }
});

app.post('/webhook', (req, res) => {
    console.log('POST: /webhook');
    const body = req.body;

    console.log(body);

    return res.status(200).send('EVENT_RECEIVED');
});

app.all('*', (req, res) => {
    res.status(404).send('Not Found');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
