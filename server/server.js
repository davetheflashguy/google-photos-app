const config = require('./config/config.js');
const express = require('express');
const async = require('async');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const http = require('http');
const persist = require('node-persist');
const winston = require('winston');

let app = express();
const PORT  = process.env.PORT || '8080'; // needs to match google api callback config

app.listen(PORT, () => {
    console.log('Server started on port ', PORT);
});

console.log('hello world');
