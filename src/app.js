const express = require('express');
const { initialize: errorHandlerInitialize } = require('./utils/error')
const cors = require('cors');
const config = require('./config');

const app = express();

app.use(cors({
  origin: config.cors.origin,
}));

// body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// api
app.use(require('./routes'));

errorHandlerInitialize(app);

module.exports = app;