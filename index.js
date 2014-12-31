var express = require('express')
	, app = express();

app.get('/', function(req, res) {
	res.send('ok api');
});

module.exports = app;