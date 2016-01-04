# orchestra-jsapi
[![Build Status](https://travis-ci.org/swissmanu/orchestra-jsapi.svg)](https://travis-ci.org/swissmanu/orchestra-jsapi) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![npm version](https://badge.fury.io/js/orchestra-jsapi.svg)](http://badge.fury.io/js/orchestra-jsapi) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

`orchestra-jsapi` abstracts the functionality provided by [harmonyhubjs-client](https://github.com/swissmanu/harmonyhubjs-client) and [harmonyhubjs-discover](https://github.com/swissmanu/harmonyhubjs-discover) behind a vanilla JavaScript interface. Using an `EventEmitter` and a simple promise based API, interaction with Logitechs Harmony hubs becomes a breeze for every Node.JS developer.


## Usages
* [orchestra](https://github.com/swissmanu/orchestra) uses `orchestra-jsapi` for interaction with Logitech Harmony hubs.
* There is an additional module called [orchestra-webapi](https://github.com/swissmanu/orchestra-webapi) which forwards `orchestra-jsapi` functions via REST and WebSockets.
