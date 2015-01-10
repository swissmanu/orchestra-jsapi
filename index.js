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
//  - webSocketApiConfig object, used to configure primus. helpful to generate the primus client library.
module.exports = {
	restApi: app
	, webSocketApi: webSocketApi.bind(null, universe)
	, webSocketApiConfig: require('./src/websocket/config')
};
