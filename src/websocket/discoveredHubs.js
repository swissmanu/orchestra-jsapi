var EventEmitter = require('events').EventEmitter
	, util = require('util');

var DiscoveredHubsTopic = function(universe) {
	var self = this;

	universe.on('discoveredHubs', function(hubs) {
		self.emit({
			topic: 'discoveredHubs'
			, data: hubs
		});
	});

	EventEmitter.call(this);
};
util.inherits(DiscoveredHubsTopic, EventEmitter);

module.exports = DiscoveredHubsTopic;
