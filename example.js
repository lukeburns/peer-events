var PeerEmitter = require('./')
var createHash = require('create-hash')

var peer = new PeerEmitter()

// join: 'greetings' to join the room 'greetings'
// send: 'greetings : hello world' to emit the 'hello world' to all connected peers listening to 'greetings'

process.stdin.on('data', function (data) {
  var split = data.toString().split(':'),
      channel = split[0].trim(),
      msg = (split[1] || '').trim(),
      hash = createHash('sha256').update(channel).digest()

  peer.emit(hash, msg)

  if (!peer.client._events[hash]) {
    peer.on(hash, function (message) {
      console.log(channel, ':', message.toString())
    })
  }
})

function id (key) {
  return key.toString('hex').slice(0, 5)
}