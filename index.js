var express = require('express')
	, app = express();

app.use('/hubs', require('./src/hubs'));

module.exports = app;