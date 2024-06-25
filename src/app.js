const express = require('express');

const app = express();

// body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// api
app.use(require('./routes'));

module.exports = app;