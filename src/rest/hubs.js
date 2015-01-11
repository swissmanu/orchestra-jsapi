var debug = require('debug')('orchestra:api:rest:hubs')
	, app = require('express')();

app.get('/', function(req, res) {
	debug('get discovered hubs');
	res.send(app.get('universe').getDiscoveredHubs());
});

app.get('/:uuid/activities', function(req, res) {
	debug('get activities for hub with uuid ' + req.params.uuid);

	var uuid = req.params.uuid
		, universe = app.get('universe');

	universe.getClientForHubWithUuid(uuid)
		.then(function(client) {
			client.getActivities()
				.then(function(activities) {
					res.send(activities);
				});
		});
});

app.get('/:uuid/activities/current', function(req, res) {
	debug('get current activity for hub with uuid ' + req.params.uuid);

	var uuid = req.params.uuid
		, universe = app.get('universe');

	universe.getClientForHubWithUuid(uuid)
		.then(function(client) {
			return client.getCurrentActivity()
		})
		.then(function(currentActivityId) {
			res.send({ id: currentActivityId });
		});
});

app.post('/:uuid/activities/:id/on', function(req, res) {
	var uuid = req.params.uuid
		, id = req.params.id
		, universe = app.get('universe');

	debug('trigger activity ' + id + ' for hub with uuid ' + req.params.uuid);

	universe.getClientForHubWithUuid(uuid)
		.then(function(client) {
			return client.startActivity(id);
		})
		.then(function() {
			res.sendStatus(200);
		});
});

module.exports = app;
