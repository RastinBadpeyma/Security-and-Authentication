const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const { verify } = require('crypto');
const app = express();

const PORT = 3000;

app.use(helmet());
require ('dotenv').config();

const config = {
  CLIENT_ID : process.env.CLIENT_ID,
  CLIENT_SECRET : process.env.CLIENT_SECRET,
}
const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
}

function verifyCallback(accessToken , refreshToken , profile , done){
  console.log('Google profile' , profile);
  done(null , profile);
}

passport.use(new Strategy(AUTH_OPTIONS , verifyCallback));
app.use(passport.initialize());



//routes
app.get('/auth/google' , 
  passport.authenticate('google' , {
   scope:['email'],
}));


app.get('/auth/google/callback' , 
   passport.authenticate('google' , {
    failureRedirect: '/failure', 
    session:false,
   }) ,
   (req,res) => {
     res.redirect('/');
   }
)

app.get('/failure', (req, res) => {
  return res.send('Failed to log in!');
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname,'public')))

 // HTTPS,Self Signed Certificates and Public Key Cryptography
 // command for cert.pem & key.pem: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 
https.createServer({
   key:fs.readFileSync('key.pem'),
   cert:fs.readFileSync('cert.pem'),
  } , app).listen(PORT, () => {
   console.log(`Listening on port ${PORT}...`);
  });