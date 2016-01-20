var debug = require('debug')('orchestra:jsapi')
var Discover = require('harmonyhubjs-discover')
var Client = require('harmonyhubjs-client')
var EventEmitter = require('events').EventEmitter
var q = require('q')
var util = require('util')

var Universe = function () {
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

  EventEmitter.call(self)
}
util.inherits(Universe, EventEmitter)

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

Universe.prototype.getDiscoveredHubs = function getDiscoveredHubs () {
  debug('return list of ' + this._discoveredHubs.length + ' discovered hubs')
  return q.when(this._discoveredHubs)
}

Universe.prototype.getActivitiesForHubWithUuid = function getActivitiesForHubWithUuid (hubUuid) {
  debug('get activities for hub with uuid ' + hubUuid)
  return this.getClientForHubWithUuid(hubUuid)
    .then(function (client) {
      return client.getActivities()
    })
}

Universe.prototype.getCurrentActivityForHub = function getCurrentActivityForHub (hubUuid) {
  debug('get current activity for hub with uuid ' + hubUuid)
  return this.getClientForHubWithUuid(hubUuid)
    .then(function (client) {
      return client.getCurrentActivity()
    })
}

Universe.prototype.startActivityForHub = function startActivityForHub (hubUuid, activityId) {
  debug('start activity ' + activityId + ' for hub ' + hubUuid)
  return this.getClientForHubWithUuid(hubUuid)
    .then(function (client) {
      return client.startActivity(activityId)
    })
}

Universe.prototype.executeAction = function executeAction (hubUuid, action) {
  debug('execute action ' + action + ' for hub ' + hubUuid)
  var encodedAction = 'action=' + action.replace(/\:/g, '::') + ':status=press'

  return this.getClientForHubWithUuid(hubUuid)
    .then(function (client) {
      return client.send('holdAction', encodedAction)
    })
}

Universe.prototype.getClientForHubWithUuid = function getClientForHubWithUuid (hubUuid) {
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

Universe.prototype.getClientForHub = function getClientForHub (hub) {
  debug('lookup client for hub ' + hub.uuid)

  if (!this._clients[hub.uuid]) {
    debug('request new client for hub ' + hub.uuid)
    return createClientForHub.call(this, hub)
  } else {
    debug('return existing client for hub' + hub.uuid)
    return q.when(this._clients[hub.uuid])
  }
}

module.exports = Universe
