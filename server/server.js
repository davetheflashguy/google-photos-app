const config = require('./config/config.js');
const express = require('express');
const session = require('express-session');
const sessionFileStore = require('session-file-store');
const async = require('async');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const http = require('http');
const persist = require('node-persist');
const winston = require('winston');

const app = express();
const fileStore = sessionFileStore(session);
const PORT  = process.env.PORT || '8080'; // needs to match google api callback config

// Set up a cache for media items that expires after 55 minutes.
// This caches the baseUrls for media items that have been selected
// by the user for the photo frame. They are used to display photos in
// thumbnails and in the frame. The baseUrls are send to the frontend and
// displayed from there. The baseUrls are cached temporarily to ensure that the
// app is responsive and quick. Note that this data should only be stored for a
// short amount of time and that access to the URLs expires after 60 minutes.
// See the 'best practices' and 'acceptable use policy' in the developer
// documentation.
const mediaItemCache = persist.create({
  dir: 'persist-mediaitemcache/',
  ttl: 3300000,  // 55 minutes
});
mediaItemCache.init();

// Temporarily cache a list of the albums owned by the user. This caches
// the name and base Url of the cover image. This ensures that the app
// is responsive when the user picks an album.
// Loading a full list of the albums owned by the user may take multiple
// requests. Caching this temporarily allows the user to go back to the
// album selection screen without having to wait for the requests to
// complete every time.
// Note that this data is only cached temporarily as per the 'best practices' in
// the developer documentation. Here it expires after 10 minutes.
const albumCache = persist.create({
  dir: 'persist-albumcache/',
  ttl: 600000,  // 10 minutes
});
albumCache.init();

// For each user, the app stores the last search parameters or album
// they loaded into the photo frame. The next time they log in
// (or when the cached data expires), this search is resubmitted.
// This keeps the data fresh. Instead of storing the search parameters,
// we could also store a list of the media item ids and refresh them,
// but resubmitting the search query ensures that the photo frame displays
// any new images that match the search criteria (or that have been added
// to an album).
const storage = persist.create({dir: 'persist-storage/'});
storage.init();

// Set up OAuth 2.0 authentication through the passport.js library.
const passport = require('passport');
const auth = require('./auth');
auth(passport);

// Set up a session middleware to handle user sessions.
// NOTE: A secret is used to sign the cookie. This is just used for this sample
// app and should be changed.
const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  store: new fileStore({}),
  secret: 'photo frame sample',
});

// Console transport for winton.
const consoleTransport = new winston.transports.Console();

// Set up winston logging.
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    consoleTransport
  ]
});

// Enable extensive logging if the DEBUG environment variable is set.
if (process.env.DEBUG) {
  // Print all winston log levels.
  logger.level = 'silly';

  // Enable express.js debugging. This logs all received requests.
  app.use(expressWinston.logger({
    transports: [
          consoleTransport
        ],
        winstonInstance: logger
  }));
  // Enable request debugging.
  require('request-promise').debug = true;
} else {
  // By default, only print all 'verbose' log level messages or below.
  logger.level = 'verbose';
}


app.listen(PORT, () => {
    console.log('Server started on port ', PORT);
});

console.log('hello world');
