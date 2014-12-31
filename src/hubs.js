var app = require('express')()
	, discover = new (require('harmonyhubjs-discover'))(61991)
	, hubs = [];

discover.on('update', function(updatedHubs) {
	hubs = updatedHubs;
});
discover.start();

app.get('/', function(req, res) {
	res.send(hubs);
});

module.exports = app;