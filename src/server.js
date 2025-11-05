require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const passport = require('./utils/passport');

const prisma = new PrismaClient();
const app = express();

// ----- Middleware -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, '..', 'public')));
console.log('✅ Serving static files from:', path.join(__dirname, '..', 'public'));



// ----- View engine & layouts -----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ----- Session -----
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // every 2 mins
      dbRecordIdIsSessionId: true,
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ----- Flash & Passport -----
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// ----- Global locals for views -----
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user || null;
  next();
});

// ----- Routes (order matters) -----
app.use('/', require('./routes/dashboard'));  // 👈 Must come before other routes
app.use('/', require('./routes/auth'));
app.use('/folders', require('./routes/folders'));
app.use('/files', require('./routes/files'));
app.use('/share', require('./routes/share'));

// ----- Health Check -----
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ----- Error handling (last middleware) -----
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});

// ----- Start server -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
