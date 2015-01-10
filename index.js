var express = require('express')
	, app = express()
	, Universe = require('./src/universe')

	, universe = new Universe()
	, restApi = require('./src/rest')
	, webSocketApi = require('./src/websocket');

app.set('universe', universe);
restApi(app);

// Expose two properties:
//  - restApi with the express api app
//  - webSocketApi function that takes an http server, ready to be attached to a primus instance.
module.exports = {
	restApi: app
	, webSocketApi: webSocketApi.bind(null, universe)
};
