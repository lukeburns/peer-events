var events = require('events')
var createHash = require('create-hash')
var protocol = require('peer-protocol').use('message')
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
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
  var id = keyPair.publicKey
  if (!name) name = id
  if (this.swarms[name]) return

  var hub = signalhub(name, ['http://130.211.202.124/'])
  var sw = this.swarms[name] = swarm(hub)

  var self = this
  sw.on('peer', function (peer) {
    var stream = protocol({ id }) // todo: proof of identification
    stream.pipe(peer).pipe(stream)
    var channel = stream.open(hash(name))
    channel.on('handshake', function (handshake) {
      self.server.on(name, function (data) {
        channel.message(data)
      })
      channel.on('message', function (message) {
        self.client.emit(name, message, stream.remoteId)
      })
      self.client.emit('connection', name, handshake)
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