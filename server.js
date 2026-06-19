// Minimal SAML SP using passport-saml
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// SAML configuration is loaded from environment variables
const SAML_OPTIONS = {
  entryPoint: process.env.SAML_ENTRY_POINT || '',
  issuer: process.env.SAML_ISSUER || process.env.SAML_ENTITY_ID || 'urn:your:sp',
  callbackUrl: process.env.SAML_CALLBACK || `http://localhost:${PORT}/auth/saml/callback`,
  cert: process.env.SAML_CERT || null, // IdP public cert (PEM)
  // Additional options can be set here
};

if (!SAML_OPTIONS.entryPoint) {
  console.warn('Warning: SAML_ENTRY_POINT is not set. SAML login will not work until you set environment variables.');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new SamlStrategy(SAML_OPTIONS,
  (profile, done) => {
    // Map profile attributes as needed
    return done(null, profile);
  }
));

app.use(session({
  secret: process.env.SESSION_SECRET || 'replace_with_a_real_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the repository root
app.use(express.static(path.join(__dirname)));

// Trigger SAML login
app.get('/login',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: false }),
  (req, res) => {
    res.redirect('/');
  }
);

// ACS endpoint
app.post('/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: false }),
  (req, res) => {
    res.redirect('/');
  }
);

// Metadata
app.get('/metadata', (req, res) => {
  const samlStrategy = passport._strategy('saml');
  res.type('application/xml');
  try {
    res.send(samlStrategy.generateServiceProviderMetadata());
  } catch (e) {
    res.status(500).send('Failed to generate metadata: ' + e.message);
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.redirect('/'));
  });
});

// Protected endpoint example
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

app.listen(PORT, () => console.log(`SAML SP listening on ${PORT}`));
