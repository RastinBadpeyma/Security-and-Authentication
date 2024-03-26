const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const { verify } = require('crypto');
const CookieSession = require('cookie-session');
const app = express();

const PORT = 3000;

app.use(helmet());
require ('dotenv').config();

const config = {
  CLIENT_ID : process.env.CLIENT_ID,
  CLIENT_SECRET : process.env.CLIENT_SECRET,
  COOKIE_KEY_1 : process.env.COOKIE_KEY_1,
  COOKIE_KEY_2 : process.env.COOKIE_KEY_2,
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

//cookieSession
app.use(CookieSession({
 name:'personal-session',
 maxAge:24*60*60*1000,
 keys:[config.COOKIE_KEY_1 , config.COOKIE_KEY_2]
}));

app.use(passport.session());

//save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//read the session from the cookie
passport.deserializeUser((obj , done) => {
  done(null , obj);
});



//Login middleware
function checkLoggedIn(req , res, next){
  const isLoggedIn = req.isAuthenticated() && req.user; 
if (!isLoggedIn) {
  res.status(401).json({
    error : "You must log in"
  })
}
 next();
}


//routes
app.get('/auth/google' , 
  passport.authenticate('google' , {
   scope:['email'],
}));


app.get('/auth/google/callback' , 
   passport.authenticate('google' , {
    failureRedirect: '/failure', 
    session:true,
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

app.get('/secret',checkLoggedIn ,(req, res) => {
  return res.send('Your personal secret value is 42!');
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