const express = require('express');
const { initialize: errorHandlerInitialize } = require('./utils/error')

const app = express();

// body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// api
app.use(require('./routes'));

errorHandlerInitialize(app);

module.exports = app;