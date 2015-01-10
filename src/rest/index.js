var debug = require('debug')('orchestra:api:rest');

module.exports = function(app) {
	debug('setup rest api on express app');
	app.use('/hubs', require('./hubs'));
};
