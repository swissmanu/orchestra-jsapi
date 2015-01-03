var debug = require('debug')('orchestra:api:hubs')
	, app = require('express')()
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
	debug('getClientForHub()');
	
	if(!clients[hub.uuid]) {
		debug('request new client for hub with uuid ' + hub.uuid);
		
		return client(hub.ip)
			.then(function(client) {
				debug('created new client for hub with uuid ' + hub.uuid);
				clients[hub.uuid] = client;
				
				return client;
			});
	} else {
		debug('return existing client for hub with uuid ' + hub.uuid);
		return q.when(clients[hub.uuid]);
	}
}



app.get('/', function(req, res) {
	debug('get discovered hubs');
	res.send(hubs);
});

app.get('/:uuid/activities', function(req, res) {
	debug('get activities for hub with uuid ' + req.params.uuid);
	
	var uuid = req.params.uuid
		, hub = hubs.filter(function(hub) { return (hub.uuid === uuid); });
	
	if(hub.length > 0) {
		hub = hub[0];

		getClientForHub(hub)
			.then(function(client) {
				client.getActivities()
					.then(function(activities) {
						res.send(activities);
					});
			});
	} else {
		throw new Error('Cannot get activities for ' + uuid);
	}
});

module.exports = app;