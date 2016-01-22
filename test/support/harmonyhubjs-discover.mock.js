'use strict'

/* global jasmine */
const DiscoverMock = () => {
  Object.assign(this, jasmine.createSpyObj('Discover', ['a']))
  return this
}

module.export = DiscoverMock
