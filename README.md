# Secure Payment Integration with Payfast
Full-Stack Payment Gateway Implementation | Node.js • Express • EJS • JavaScript

## Project Overview
This project demonstrates a secure and fully functional integration of the PayFast payment gateway into a Node.js and Express application.

It implements the complete payment lifecycle, including:

Payment initiation

Secure redirection to PayFast

Instant Transaction Notification (ITN) handling

Server-side transaction validation

MD5 signature verification for payment authenticity

All payment flows were tested and validated using the PayFast Sandbox environment.

## Tech Stack

Backend: Node.js, Express.js

Frontend: EJS, HTML, CSS, JavaScript

Payment Gateway: PayFast

Security: MD5 Signature Validation

## Features

1. Secure payment processing with PayFast

2. ITN (Instant Transaction Notification) handling

3. Server-side payment verification

4. MD5 signature validation

5. Protection against tampered transaction data

6. Dynamic checkout page rendered using EJS

7. Sandbox testing for full payment lifecycle validation

## Security Implementation

* Server-side signature verification using MD5 hashing

* Validation of transaction amount against original order

* Merchant identity confirmation

* Secure ITN endpoint processing

* Sensitive credentials stored using environment variables

## Installation & Setup
Clone the repository
```bash
git clone https://github.com/Nkululeko1999/payfast-integration.git
```
cd payfast-integration

## Install dependencies
npm install

## Configure environment variables

Create a .env file in the root directory:

```bash
NODE_ENV=
DYNAMIC_PASS_PHRASE=
MERCHANT_ID=
MERCHANT_KEY=
NOTIFY_URL=
CANCEL_URL=
RETURN_URL=
```

## NGROK
For local development and ITN (Instant Transaction Notification) testing, you must install and configure ngrok.

PayFast cannot send ITN requests to localhost, so ngrok is required to expose your local server to the internet during testing.

## Start the server
npm run dev
