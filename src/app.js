const express = require('express');

const app = express();

// api
app.use(require('./routes'));

module.exports = app;