import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import fs from "fs";
import { pfValidIP, pfValidPaymentData, pfValidServerConfirmation, pfValidSignature } from "./security.checks.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.redirect('/checkout')
})

app.get("/checkout", (req, res) => {
  res.render("checkout.ejs", {dynamicForm: htmlForm});
});

app.get("/return", (req, res) => {
    res.render("return.ejs");
});

app.get("/cancel", (req, res) => {
    res.render("/cancel.ejs");
});

const pfHost = process.env.NODE_ENV === "development" ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';


const myPassphrase = process.env.DYNAMIC_PASS_PHRASE;
const cartTotal = 600.00; // This should be dynamically retrieved based on your application logic

app.post("/notify", async (req, res) => {
  const pfData = req.body;
  let pfParamString = "";
  for (let key in pfData) {
    if (pfData.hasOwnProperty(key) && key !== "signature") {
      pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  try {
    const check1 = pfValidSignature(pfData, pfParamString, myPassphrase);
    const check2 = await pfValidIP(req); // Note: pfValidIP is async and returns a Promise
    const check3 = pfValidPaymentData(cartTotal, pfData);
    const check4 = await pfValidServerConfirmation(pfHost, pfParamString); // async and returns a Promise

    // Define the data to be logged
    let logData = `Date: ${new Date().toISOString()}\n`;
    logData += `Check 1 (Valid Signature): ${check1}\n`;
    logData += `Check 2 (Valid IP): ${check2}\n`;
    logData += `Check 3 (Valid Payment Data): ${check3}\n`;
    logData += `Check 4 (Server Confirmation): ${check4}\n`;
    logData += `Received Data:\n${JSON.stringify(pfData, null, 2)}\n\n`;

    console.log(logData);

    // Writing the log data to notify.txt
    fs.writeFile('notify.txt', logData, 'utf8', (err) => {
      if (err) {
        console.error('An error occurred while writing to file:', err);
        res.status(500).send("An error occurred while processing the notification.");
      } else {
        console.log('Notification data written to file successfully.');
        // Render the notify.ejs template with the results
        res.render("notify", { check1, check2, check3, check4 });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the notification.");
  }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Step 2: Security Signature
const generateSignature = (data, passPhrase = null) => {
  // Create parameter string
  let pfOutput = "";
  for (let key in data) {
    if(data.hasOwnProperty(key)){
      if (data[key] !== "") {
        pfOutput +=`${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
};


// Step 3: Send customer to oayfast for payment
const myData = [];
// Merchant details
myData["merchant_id"] = process.env.MERCHANT_ID;
myData["merchant_key"] = process.env.MERCHANT_KEY;
myData["return_url"] = process.env.RETURN_URL;
myData["cancel_url"] = process.env.CANCEL_URL;
myData["notify_url"] = process.env.NOTIFY_URL;

// Buyer details
myData["name_first"] = "First Name";
myData["name_last"] = "Last Name";
myData["email_address"] = "test@test.com";
// Transaction details
myData["m_payment_id"] = "00001";
myData["amount"] = "600.00";
myData["item_name"] = "#00001";

// Generate signature
myData["signature"] = generateSignature(myData, myPassphrase);

let htmlForm = `<form action="https://${pfHost}/eng/process" method="post">`;
for (let key in myData) {
  if(myData.hasOwnProperty(key)){
    const value = myData[key];
    if (value !== "") {
      htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
    }
  }
}

htmlForm += '<input type="submit" class="button-cta" value="Pay Now" /></form>';