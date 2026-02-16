// security.checks.js
import axios from "axios";
import crypto from "crypto";
import dns from 'dns';

// Verify the signature
const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
    let paramString = pfParamString;
    if (pfPassphrase !== null) {
        paramString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }
    const signature = crypto.createHash("md5").update(paramString).digest("hex");
    return pfData['signature'] === signature;
};

// Check that the notification has come from a valid Payfast domain
const pfValidIP = async (req) => {
    const validHosts = [
        'www.payfast.co.za',
        'sandbox.payfast.co.za',
        'w1w.payfast.co.za',
        'w2w.payfast.co.za'
    ];
    let validIps = [];
    const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        for (let host of validHosts) {
            const ips = await ipLookup(host);
            validIps = [...validIps, ...ips];
        }
    } catch (err) {
        console.error(err);
    }

    const uniqueIps = [...new Set(validIps)];
    return uniqueIps.includes(pfIp);
};

// Compare payment data
const pfValidPaymentData = (cartTotal, pfData) => {
    return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
};

// Perform a server request to confirm the details
const pfValidServerConfirmation = async (pfHost, pfParamString) => {
    try {
        const response = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data === 'VALID';
    } catch (error) {
        console.error('Error in server confirmation:', error);
        return false;
    }
};

// Helper function for IP lookup
async function ipLookup(domain) {
    return new Promise((resolve, reject) => {
        dns.lookup(domain, { all: true }, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                resolve(addresses.map(a => a.address));
            }
        });
    });
}

// Export the functions to make them available for import
export { pfValidSignature, pfValidIP, pfValidPaymentData, pfValidServerConfirmation };
