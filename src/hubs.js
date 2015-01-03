var app = require('express')()
	, q = require('q')
	, discover = new (require('harmonyhubjs-discover'))(61991)
	, client = require('harmonyhubjs-client')
	, hubs = []
	, clients = {};


discover.on('update', function(updatedHubs) {
	hubs = updatedHubs;
});
discover.start();


function getClientForHub(hub) {
	var deferred = q.defer();
	
	if(!clients[hub.uuid]) {
		client(hub.ip)
			.then(function(client) {
				clients[hub.uuid] = client;
				deferred.resolve(client);
			});
	} else {
		deferred.resolve(clients[hub.uuid]);
	}
	
	return deferred.promise;
}


app.get('/', function(req, res) {
	res.send(hubs);
});

app.get('/:uuid/activities', function(req, res) {
	var uuid = req.params.uuid
		, hub = hubs.filter(function(hub) { return (hub.uuid === uuid); })
		, client;
	
	if(hub.length > 0) { hub = hub[0]; }
	
	getClientForHub(hub)
		.then(function(client) {
			client.getActivities()
				.then(function(activities) {
					res.send(activities);
				});
		});
});

module.exports = app;