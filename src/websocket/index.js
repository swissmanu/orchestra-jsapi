var debug = require('debug')('orchestra:api:websocket')
	, Primus = require('primus')
	, isObject = require('amp-is-object')
	, isString = require('amp-is-string')

	, sparks = {};

function registerNewSpark(spark) {
	debug('registerNewSpark(' + spark.id + ')');

	sparks[spark.id] = {
		spark: spark
		, subscribedTopics: []
	};
}

function unregisterSpark(spark) {
	debug('unregisterSpark(' + spark.id + ')');
	sparks[spark.id] = undefined;
}

function onPublishFromTopicPublisher(knownSparks, message) {
	Object.keys(knownSparks).forEach(function(sparkId) {
		var knownSpark = knownSparks[sparkId]
			, sparkSubscribedTopic = knownSpark.subscribedTopics.some(function(topic) {
				return topic === message.topic;
			});

		if(sparkSubscribedTopic) {
			debug('publish ' + message.topic + ' to ' + sparkId);
			knownSpark.spark.write(message);
		}
	});
}

function onDataFromSpark(spark, data) {
	debug('onDataFromSpark(' + data + ')');

	if(isObject(data) && isString(data.action) && isString(data.topic)) {
		if(data.action === 'subscribe') {
			debug('spark ' + spark.id + ' subscribes to topic ' + data.topic);
			sparks[spark.id].subscribedTopics.push(data.topic);
		} else if(data.action === 'unsubscribe') {
			debug('spark ' + spark.id + ' unsubscribes from topic ' + data.topic);
			sparks[spark.id].subscribedTopics.splice(sparks[spark.id].subscribedTopics.indexOf(data.topic), 1);
		}
	}
}


module.exports = function(universe, httpServer) {
	debug('setup primus on http server');
	var primusConfig = require('./config')
		, primus = new Primus(httpServer, primusConfig);

	[
		new (require('./discoveredHubs'))(universe)
		, new (require('./stateDigest'))(universe)
	]
		.forEach(function(publisher) {
			publisher.on('publish', onPublishFromTopicPublisher.bind(null, sparks));
		});

	primus.on('connection', function(spark) {
		debug('new connection from spark ' + spark.id);
		registerNewSpark.call(spark, spark);
		spark.on('data', onDataFromSpark.bind(spark, spark));
	});

	primus.on('disconnect', function(spark) {
		debug('spark ' + spark.id + ' disconnected');
		unregisterSpark(spark);
	});
};
