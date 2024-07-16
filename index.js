const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
})

app.get('/', (req, res) => {
    res.send('Health check');
});

app.get('/webhook', (req, res) => {
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

// app.post('/webhook', (req, res) => {
//     const body = req.body;

//     console.log(body);

//     return res.status(200).send('EVENT_RECEIVED');
// });

// utility functions for handling the webhook callbacks
const unsubscribe_user_from_further_messages = (phone_number) => {
    // add logic to unsubscribe user from the service
    console.log(`Unsubscribing user with phone number: ${phone_number}`);
};

const handle_message_callback = (value) => {
    const { messaging_product, messages = [], statuses = []} = value;
    messages
    if (messaging_product !== 'whatsapp') return;

    for (const message of messages) {
        console.log({message});

        const { from: fromPhone, type, text } = message; // from is of form '91<phone_number>' for India
        if (type !== 'text') continue;

        const { body: userMessage } = text;

        console.log({fromPhone, userMessage});
        // our system keeps 'Unsubscribe' as a keyword to unsubscribe from the service
        if(userMessage.toLowerCase().trim() === 'Unsubscribe'.toLowerCase()) {
            unsubscribe_user_from_further_messages(fromPhone);
            
        }
    }

    for(const statusData of statuses) {
        const {status, recipient_id} = statusData;
        console.log({status, recipient_id});
    }
};


app.post('/webhook', (req, res) => {
    const { object, entry: entries } = req.body;

    console.log({object});
    if (object !== 'whatsapp_business_account') {
        // return from here only
        return res.status(200).send('EVENT_RECEIVED');
    }

    for (const entry of entries) {
        const {
            changes: { field, value }
        } = entry;

        console.log({field});
        //will have different field values here, will handle them accordingly
        switch (field) {
            case 'messages':
                handle_message_callback(value);
                break;
            case 'message_template_status_update':
                // handle_template_callback(value);
                break;
            default:
                // handle other cases here
                break;
        }
    }

    // will handle different cases here

    return res.status(200).send('EVENT_RECEIVED');
});

app.all('*', (req, res) => {
    res.status(404).send('Not Found');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
