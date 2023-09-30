import express from "express";
import bodyParser from "body-parser";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import User from "./models/User";

// app.post('/api/webhooks/user', bodyParser.raw({type: 'application/json'}), function(req, res) {
//     // try {
//     //     const payload = req.body;
//     //   var headers = req.headers;

//     //     const wh = new Webhook("whsec_cuQA8EFMSSsZ7mBm3leqT/VtR0mY7aiX");
//     //     const evt = wh.verify(req.body, headers) as WebhookEvent;
//     //     const { id } = evt.data;
//     //     // Handle the webhook
//     //     const eventType = evt.type;
//     //     if (eventType === "user.created") {
//     //       console.log(`User ${id} was ${eventType}`);
//     //     }
//     //     console.log(evt.data);
//     //      res.status(200).json({
//     //         success: true,
//     //         message: 'Webhook received'
//     //      })
//     // } catch (err) {
//     //     res.status(400).json({
//     //         success: false,
//     //         message: err.message
//     //     })
//     // }

//     const payload = req.body;
//     const headers = {
//         "svix-id" : req.headers["svix-id"],
//         "svix-timestamp" : req.headers["svix-timestamp"] ,
//         "svix-signature" : req.headers["svix-signature"]
//     };
//     const webhook_secret = process.env.CLERK_WEBHOOK_SECRET_KEY || "";

//     console.log("req.body", payload);
//     const wh = new Webhook(payload, heads);
//     let msg;

//     try {
//         msg = wh.verify(payload, headers);
//         console.log(msg);
//         res.json({
//             "success" : true
//         });
//     } catch (err) {
//         res.status(400).json({});
//     }
// })

mongoose
  .connect(process.env["MONGO_URI"] || "")
  .then(() => {
    console.log("mongodb connected successfully");
  })
  .catch((err) => {
    console.log("Error occured in connecting mongodb", err);
  });

app.use(express.json());

app.post("/api/webhooks/user", async(req, res) => {
  console.log("request accepted");
  console.log("req.body => ", req.body);
  console.log("req.headers => req.headers", req.headers);
  try {
    const payload = req.body;
    const headers = {
      "svix-id": req.headers["svix-id"] || "",
      "svix-timestamp": req.headers["svix-timestamp"] || "",
      "svix-signature": req.headers["svix-signature"] || "",
    } as WebhookRequiredHeaders;
    const webhook_secret =
      process.env['CLERK_WEBHOOK_SECRET_KEY'] ||
      "whsec_MFDzS6N6W9dRtCnsrOW3AecIAOtK3yG6";

    const wh = new Webhook(webhook_secret);
    const evt = wh.verify(JSON.stringify(payload), headers) as WebhookEvent;
    console.log("evt => ", evt);
    const { id } = evt.data;
    // Handle the webhook
    const eventType = evt.type;
    if (eventType === "user.created") {
      console.log(`User ${id} was ${eventType}`);
      const email_address = req.body.data.email_addresses[0].email_address;
      const { first_name, last_name, profile_image_url } = req.body.data;

      const newUser = await User.create({
        email : email_address,
        name : first_name,
        image : profile_image_url
      })
      
    }
    res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({});
  }
});

app.listen(8000, () => {
  console.log("server is running....");
});
