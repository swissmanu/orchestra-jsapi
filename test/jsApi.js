/* global jasmine, describe, beforeEach, it, expect */
'use strict'

const mock = require('mock-require')
mock('harmonyhubjs-client', require('./support/harmonyhubjs-client.mock'))
mock('harmonyhubjs-discover', require('./support/harmonyhubjs-discover.mock'))

const JsApi = require('../dist/index')

describe('JsApi', () => {
  beforeEach(() => {
    this.jsApi = new JsApi()
  })

  describe('constructor()', () => {
    it('should prepare an empty _discoveredHubs array', () => {
      expect(this.jsApi._discoveredHubs).toEqual([])
    })

    it('should prepare an empty _clients hash', () => {
      expect(this.jsApi._clients).toEqual({})
    })

    describe('sets up harmonyhubjs-discover so that it', () => {
      it('should be available as _discover', () => {
        expect(this.jsApi._discover).toBeDefined()
      })

      it('should use port 61991 for hub discovery responses', () => {
        expect(this.jsApi._discover.constructorArguments).toEqual([61991])
      })

      it('should have registered an event handler for "update"', () => {
        expect(this.jsApi._discover.on).toHaveBeenCalledWith('update', jasmine.any(Function))
      })

      it('should have registered an event handler for "online"', () => {
        expect(this.jsApi._discover.on).toHaveBeenCalledWith('online', jasmine.any(Function))
      })

      it('should have registered an event handler for "offline"', () => {
        expect(this.jsApi._discover.on).toHaveBeenCalledWith('online', jasmine.any(Function))
      })

      it('should have started discovery', () => {
        expect(this.jsApi._discover.start).toHaveBeenCalled()
      })
    })
  })

  describe('getDiscoveredHubs()', () => {
    it('should return _discoveredHubs in a promise', (done) => {
      const discoveredHubs = ['han', 'chewie']

      this.jsApi._discoveredHubs = discoveredHubs
      this.jsApi.getDiscoveredHubs()
        .then((hubs) => {
          expect(hubs).toEqual(discoveredHubs)
          done()
        })
    })
  })
})
