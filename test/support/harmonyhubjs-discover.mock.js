'use strict'

/* global jasmine */
class DiscoverMock {
  constructor () {
    this.constructorArguments = Array.prototype.slice.call(arguments)

    this.on = jasmine.createSpy('on')
    this.start = jasmine.createSpy('start')
  }
}

module.exports = DiscoverMock
