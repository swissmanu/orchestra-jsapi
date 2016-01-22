/* global describe, beforeEach */
'use strict'

const mock = require('mock-require')
mock('harmonyhubjs-client', require('./support/harmonyhubjs-client.mock'))
mock('harmonyhubjs-discover', require('./support/harmonyhubjs-discover.mock'))

const JsApi = require('../dist/index')

describe('JsApi', () => {
  beforeEach(() => {
    this.jsApi = new JsApi()
  })

  describe('getDiscoveredHubs()', () => {
    // it('should return _discoveredHubs in a promise', (done) => {
    //   const discoveredHubs = ['han', 'chewie']
    //
    //   this.jsApi._discoveredHubs = discoveredHubs
    //   this.jsApi.getDiscoveredHubs()
    //     .then((hubs) => {
    //       expect(hubs).toEqual(discoveredHubs)
    //       done()
    //     })
    // })
  })
})
