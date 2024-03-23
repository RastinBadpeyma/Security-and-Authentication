const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const app = express();

const PORT = 3000;

app.use(helmet());







 // HTTPS,Self Signed Certificates and Public Key Cryptography
 // command for cert.pem & key.pem: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 

https.createServer({
   key:fs.readFileSync('key.pem'),
   cert:fs.readFileSync('cert.pem'),
  } , app).listen(PORT, () => {
   console.log(`Listening on port ${PORT}...`);
  });