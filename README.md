# Peer Events

A p2p EventEmitter. Listen for and emit events on a [swarm](https://github.com/mafintosh/discovery-swarm).

```
npm install peer-events
```

## Usage

```js
var PeerEmitter = require('peer-events')

var peer = new PeerEmitter()

// listen for events from peers on swarm
peer.on('message', (message) => console.log(message))

// emit event to peers on swarm
peer.emit('message', 'hello world')
```

## API

```js
var peer = new PeerEmitter()
```

Create a new instance. The returned object is a duplex stream.

```js
peer.open(key)
```

Begin looking for and connecting to peers on the channel `key`.

```js
peer.emit(key, data)
```

Emit event to all peers listening on `key`.

```js
peer.on(key, callback)
```

Listen for events on `key`.