let config = require('./config/config.js');
let express = require('express');

let app = express();
const PORT  = process.env.PORT || '8080'; // needs to match google api callback config

app.listen(PORT, () => {
    console.log('Server started on port ', PORT);
});

console.log('hello world');
