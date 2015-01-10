var debug = require('debug')('orchestra:api:websocket:discoveredhubs')
	, EventEmitter = require('events').EventEmitter
	, util = require('util');

var DiscoveredHubsTopic = function(universe) {
	var self = this;

	universe.on('discoveredHubs', function(hubs) {
		debug('received discoveredHubs event from universe. there are ' + hubs.length +' hubs');

		self.emit('publish', {
			topic: 'discoveredHubs'
			, data: hubs
		});
	});

	EventEmitter.call(this);
};
util.inherits(DiscoveredHubsTopic, EventEmitter);

module.exports = DiscoveredHubsTopic;
