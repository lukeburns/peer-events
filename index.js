var events = require('events')
var createHash = require('create-hash')
var protocol = require('peer-protocol').use('message')
var swarm = require('discovery-swarm')
var signatures = require('sodium-signatures')

module.exports = Peer

function Peer (keyPair) {
  if (!keyPair) keyPair = signatures.keyPair()
  this.keyPair = keyPair

  this.swarms = {}
  this.server = new events.EventEmitter()
  this.client = new events.EventEmitter()
}

Peer.prototype.open = function (name) {
  var keyPair = this.keyPair
  if (!name) name = keyPair.publicKey
  if (this.swarms[name]) return

  var sw = this.swarms[name] = swarm()
  sw.join(name)

  var self = this
  sw.on('connection', function (socket) {
    var stream = protocol({ keyPair }) // todo: proof of identification
    stream.pipe(socket).pipe(stream)

    var key = (typeof name === 'string') ? hash(name) : name
    var channel = stream.open(key)
    channel.on('handshake', function () {
      self.server.on(name, function (data) {
        channel.message(data)
      })
      channel.on('message', function (message) {
        self.client.emit(name, message)
      })
      self.client.emit('connection')
    })
  })
}

Peer.prototype.on = function (name, handler) {
  if (!handler) {
    handler = name
    name = this.keyPair.publicKey
  }
  this.open(name)
  return this.client.on(name, handler)
}

Peer.prototype.emit = function (name, data) {
  if (typeof data === 'undefined') {
    data = name
    name = this.keyPair.publicKey
  }
  this.open(name)
  return this.server.emit(name, data)
}

function hash (name) {
  var hash = createHash('sha256')
  hash.update(name)
  return hash.digest()
}
