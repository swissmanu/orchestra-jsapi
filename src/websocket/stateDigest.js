var debug = require('debug')('orchestra:api:websocket:statedigest')
	, EventEmitter = require('events').EventEmitter
	, util = require('util');

var StateDigestTopic = function(universe) {
	var self = this;

	universe.on('stateDigest', function(message) {
		debug('received stateDigest event from universe for hub ' + message.hub.uuid);

		self.emit('publish', {
			topic: 'stateDigest'
			, data: {
				hub: message.hub
				, stateDigest: message.stateDigest
			}
		});
	});

	EventEmitter.call(this);
};
util.inherits(StateDigestTopic, EventEmitter);

module.exports = StateDigestTopic;
