var debug = require('debug')('orchestra:jsapi')
	, Discover = require('harmonyhubjs-discover')
	, Client = require('harmonyhubjs-client')
	, EventEmitter = require('events').EventEmitter
	, q = require('q')
	, util = require('util');

var Universe = function() {
	var self = this;

	self._discover = new Discover(61991);
	self._discoveredHubs = [];
	self._clients = {};

	self._discover.on('update', function(hubs) {
		debug('received update event from harmonyhubjs-discover. there are ' + hubs.length + ' hubs');
		self._discoveredHubs = hubs;
		self.emit('discoveredHubs', hubs);
	});
	self._discover.start();

	EventEmitter.call(self);
};
util.inherits(Universe, EventEmitter);


function createClientForHub(hub) {
	var self = this;

	return Client(hub.ip)
		.then(function(client) {
			debug('created new client for hub with uuid ' + hub.uuid);

			client._xmppClient.on('offline', function() {
				debug('client for hub ' + hub.uuid + ' went offline. re-establish.');
				self._clients[hub.uuid] = undefined;
				return createClientForHub.call(self, hub);
			});

			client.on('stateDigest', function(stateDigest) {
				debug('got state digest. reemit it');
				self.emit('stateDigest', {
					hub: hub
					, stateDigest: stateDigest
				});
			});

			self._clients[hub.uuid] = client;
			return client;
		});
}

Universe.prototype.getDiscoveredHubs = function getDiscoveredHubs() {
	debug('return list of ' + this._discoveredHubs.length + ' discovered hubs');
	return q.when(this._discoveredHubs);
};

Universe.prototype.getActivitiesForHubWithUuid = function getActivitiesForHubWithUuid(uuid) {
	return this.getClientForHubWithUuid(uuid)
		.then(function(client) {
			return client.getActivities();
		});
};

Universe.prototype.getCurrentActivityForHub = function getCurrentActivityForHub(uuid) {
	return this.getClientForHubWithUuid(uuid)
		.then(function(client) {
			return client.getCurrentActivity()
		})
};

Universe.prototype.startActivityForHub = function startActivityForHub(hubUuid, activityId) {
	return this.getClientForHubWithUuid(hubUuid)
		.then(function(client) {
			return client.startActivity(activityId);
		});
};

Universe.prototype.getClientForHubWithUuid = function getClientForHubWithUuid(uuid) {
	debug('getClientForHubWithUuid(' + uuid + ')');

	var self = this;

	return this.getDiscoveredHubs()
		.then(function(hubs) {
			hubs = hubs.filter(function(hub) { return (hub.uuid === uuid); });

			if(hubs.length > 0) {
				return self.getClientForHub(hubs[0]);
			} else {
				throw new Error('no hub with uuid ' + uuid + ' discovered yet');
			}
		});
};

Universe.prototype.getClientForHub = function getClientForHub(hub) {
	debug('getClientForHub(' + hub.uuid + ')');

	if(!this._clients[hub.uuid]) {
		debug('request new client for hub with uuid ' + hub.uuid);
		return createClientForHub.call(this, hub);
	} else {
		debug('return existing client for hub with uuid ' + hub.uuid);
		return q.when(this._clients[hub.uuid]);
	}
};

module.exports = Universe;
