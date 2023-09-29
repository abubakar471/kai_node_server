const express = require("express");
const bodyParser = require("body-parser");
const {Webhook} =require("svix");
// import {WebhookEvent} from "@clerk/clerk-sdk-node"
const app = express();

app.post('/webhook', bodyParser.raw({type: 'application/json'}), async function(req, res) {
    try {
        const payload = req.body;
        const headers = req.headers;
 
        const wh = new Webhook("whsec_cuQA8EFMSSsZ7mBm3leqT/VtR0mY7aiX");
        const evt = wh.verify(payload, headers);
        const { id } = evt.data;
        // Handle the webhook
        const eventType = evt.type;
        if (eventType === "user.created") {
          console.log(`User ${id} was ${eventType}`);
        }
        console.log(evt.data);
        res.status(200).json({
            success: true,
            message: 'Webhook received'
         })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
})

app.listen(8000,() => {
    console.log("server is running....");
})