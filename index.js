'use strict'

var debug = require('debug')('orchestra:jsapi')
var Discover = require('harmonyhubjs-discover')
var Client = require('harmonyhubjs-client')
var EventEmitter = require('events').EventEmitter

function createClientForHub (hub) {
  var self = this

  return Client(hub.ip)
    .then(function (client) {
      debug('created new client for hub with uuid ' + hub.uuid)

      client._xmppClient.on('offline', function () {
        debug('client for hub ' + hub.uuid + ' went offline. re-establish.')
        self._clients[hub.uuid] = undefined
        return createClientForHub.call(self, hub)
      })

      client.on('stateDigest', function (stateDigest) {
        debug('got state digest. reemit it')
        self.emit('stateDigest', {
          hub: hub,
          stateDigest: stateDigest
        })
      })

      self._clients[hub.uuid] = client
      return client
    })
}

/**
 * JsApi is a [facade](https://en.wikipedia.org/wiki/Facade_pattern) for
 * [harmonyhubjs-client](https://github.com/swissmanu/harmonyhubjs-client)
 * and [harmonyhubjs-client](https://github.com/swissmanu/harmonyhubjs-discover).
 *
 * It allows easy interaction with the services provided by these libraries
 * and abstracts various low-level topics away. Exposed is a set of simple,
 * promise-based functions which allow to interact with Logitech Harmony Hubs
 * in the local network.
 *
 * ### Events
 * An instance of JsApi is an
 * [EventEmitter](https://nodejs.org/api/events.html). You can subscribe to
 * following events:
 *
 * <dl>
 *   <dt>`discoveredHubs`</dt>
 *   <dd>
 *     Emitted when a hub was discoverd or went offline. An array with
 *     <em>all</em> currently available hubs is available as payload.
 *   </dd>
 *   <dt>`hubOnline`</dt>
 *   <dd>
 *     Signals that a specific hub was discovered. An object with the hubs
 *     information gets sent along.
 *   </dd>
 *   <dt>`hubOffline`</dt>
 *   <dd>
 *     Signals that a specific hub went offline. The hubs information object is
 *     passed along with the event.
 *   </dd>
 *   <dt>`stateDigest`<dt>
 *   <dd>
 *     This event notifies about a change of the state of a specific hub. You
 *     can expect an object like `{ hub: { ... }, stateDigest: { ... } }` as
 *     payload. The `stateDigest` property will contain information as described
 *     in the [stateDigest Event Documentation](https://github.com/swissmanu/harmonyhubjs-client/blob/master/docs/protocol/stateDigest.md)
 *     by harmonyhubjs-client.
 * </dl>
 */
class JsApi extends EventEmitter {
  constructor () {
    super()
    var self = this

    self._discover = new Discover(61991)
    self._discoveredHubs = []
    self._clients = {}

    self._discover.on('update', function (hubs) {
      debug('received update event from harmonyhubjs-discover. there are ' + hubs.length + ' hubs')
      self._discoveredHubs = hubs
      self.emit('discoveredHubs', hubs)
    })

    self._discover.on('online', function (hub) {
      self.emit('hubOnline', hub)
    })

    self._discover.on('offline', function (hub) {
      self.emit('hubOffline', hub)
    })
    self._discover.start()
  }

  /**
   * Returns an array with all currently known hubs. You might not get the
   * result you expect the first time you call this. Since JsApi constantly
   * scans your local network for hubs, the result of this function may differ
   * from call to call.
   *
   * You might be interested in the events described in the class description
   * too.
   *
   * @return {Promise} Resolves with an array of currently available hubs.
   */
  getDiscoveredHubs () {
    debug('return list of ' + this._discoveredHubs.length + ' discovered hubs')
    return Promise.resolve(this._discoveredHubs)
  }

  /**
   * Looks up all available activities for a hub with given UUID.
   *
   * @param {String} hubUuid The UUID of the hub whose activities should be
   *                         looked up.
   * @return {Promise} Resolves with an array of activities for the requestes
   *                   hub.
   */
  getActivitiesForHubWithUuid (hubUuid) {
    debug('get activities for hub with uuid ' + hubUuid)
    return this.getClientForHubWithUuid(hubUuid)
      .then(function (client) {
        return client.getActivities()
      })
  }

  /**
   * Looks up the currently running activity of a hub with given UUID.
   *
   * @param {String} hubUuid The UUID of the hub whose current activity should
   *                         be looked up.
   * @return {Promise} Resolves with an object containing information about the
   *                   currently running activity of the hub.
   */
  getCurrentActivityForHub (hubUuid) {
    debug('get current activity for hub with uuid ' + hubUuid)
    return this.getClientForHubWithUuid(hubUuid)
      .then(function (client) {
        return client.getCurrentActivity()
      })
  }

  /**
   * Starts an activity with given ID for the hub with the specified UUID.
   *
   * If you don't know the available activity ID's, use
   * {@link JsApi#getActivitiesForHubWithUuid} to learn more about the hub.
   *
   * @param {String} hubUuid The UUID of the hub which should start the
   *                         activity.
   * @param {String} activityId The ID of the activity intended to start.
   * @return {Promise} Resolves as soon as the activity was started
   *                   successfully.
   */
  startActivityForHub (hubUuid, activityId) {
    debug('start activity ' + activityId + ' for hub ' + hubUuid)
    return this.getClientForHubWithUuid(hubUuid)
      .then(function (client) {
        return client.startActivity(activityId)
      })
  }

  executeAction (hubUuid, action) {
    debug('execute action ' + action + ' for hub ' + hubUuid)
    var encodedAction = 'action=' + action.replace(/\:/g, '::') + ':status=press'

    return this.getClientForHubWithUuid(hubUuid)
      .then(function (client) {
        return client.send('holdAction', encodedAction)
      })
  }

  getClientForHubWithUuid (hubUuid) {
    debug('get client for hub ' + hubUuid)

    var self = this

    return this.getDiscoveredHubs()
      .then(function (hubs) {
        hubs = hubs.filter(function (hub) { return (hub.uuid === hubUuid) })

        if (hubs.length > 0) {
          return self.getClientForHub(hubs[0])
        } else {
          throw new Error('no hub with uuid ' + hubUuid + ' discovered yet')
        }
      })
  }

  getClientForHub (hub) {
    debug('lookup client for hub ' + hub.uuid)

    if (!this._clients[hub.uuid]) {
      debug('request new client for hub ' + hub.uuid)
      return createClientForHub.call(this, hub)
    } else {
      debug('return existing client for hub' + hub.uuid)
      return Promise.resolve(this._clients[hub.uuid])
    }
  }
}

module.exports = JsApi
