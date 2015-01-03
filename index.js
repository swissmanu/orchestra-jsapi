var express = require('express')
	, app = express();

app.use('/api/hubs', require('./src/hubs'));

module.exports = app;