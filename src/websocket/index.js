var debug = require('debug')('orchestra:api:websocket')
	, Primus = require('primus');

module.exports = function(httpServer) {
	debug('setup primus on http server');
	new Primus(httpServer);
};
