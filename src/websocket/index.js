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

function onPublishFromTopicPublisher(sparks, message) {
	Object.keys(sparks).forEach(function(sparkId) {
		var spark = sparks[sparkId]
			, sparkSubscribedTopic = spark.subscribedTopics.some(function(topic) {
				return topic === message.topic;
			});

		if(sparkSubscribedTopic) {
			spark.write(message);
		}
	});
}

function onDataFromSpark(data) {
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
	var primus = new Primus(httpServer);

	[ new (require('./discoveredHubs'))(universe) ]
		.forEach(function(publisher) {
			publisher.on('publish', onPublishFromTopicPublisher.bind(null, sparks));
		});

	primus.on('connection', function(spark) {
		debug('new connection from spark ' + spark.id);
		registerNewSpark(spark);
		spark.on('data', onDataFromSpark);
	});

	primus.on('disconnect', function(spark) {
		debug('spark ' + spark.id + ' disconnected');
		unregisterSpark(spark);
	});
};
