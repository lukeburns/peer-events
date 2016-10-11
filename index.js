var events = require('events')
var createHash = require('create-hash')
var protocol = require('peer-protocol')
var swarm = require('discovery-swarm')
var signatures = require('sodium-signatures')

module.exports = PeerEmitter

function PeerEmitter (keyPair) {
  if (!keyPair) keyPair = signatures.keyPair()
  this.keyPair = keyPair

  this.protocol = protocol.use('message') // default 'message'
  this.swarms = {}
  this.remote = new events.EventEmitter()
  this.local = new events.EventEmitter()
}

PeerEmitter.prototype.open = function (channel) {
  var keyPair = this.keyPair
  var id = keyPair.publicKey
  if (!channel) channel = id
  if (this.swarms[channel]) return this.swarms[channel]

  var key = (typeof channel === 'string') ? hash(channel) : channel

  var sw = this.swarms[channel] = swarm()
  sw.join(key)

  var self = this
  sw.on('connection', function (socket) {
    var stream = self.protocol({ id }) // todo: proof of identification
    stream.pipe(socket).pipe(stream)

    var ch = stream.open(key)
    ch._name = channel
    ch.on('handshake', function (handshake) {
      var id = handshake.id
      self.remote.on(channel, function (data) {
        ch.message(data)
      })
      ch.on('message', function (message) {
        self.local.emit(channel, message, id)
      })
      self.local.emit('connection', channel, id)
    })
  })
}

PeerEmitter.prototype.on = function (channel, handler) {
  if (typeof channel === 'function') {
    handler = channel
    channel = this.keyPair.publicKey
  }
  this.open(channel)
  return this.local.on(channel, handler)
}

PeerEmitter.prototype.emit = function (channel, data) {
  if (typeof data === 'undefined') {
    data = name
    name = this.keyPair.publicKey
  }
  this.open(channel)
  return this.remote.emit(channel, data)
}

function hash (channel) {
  var hash = createHash('sha256')
  hash.update(channel)
  return hash.digest()
}

// Todo:
//   - Couple message encoding/decoding and channels
//   - Filtering
//   - More control over individual sockets (for implementing e.g. handshakes)
//   - Open multiple channels with each peer