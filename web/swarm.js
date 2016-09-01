var PeerEmitter = require('./')
window.emitter = new PeerEmitter()
console.log('your name is:', window.emitter.keyPair.publicKey.toString('hex').slice(0, 5))

window.emitter.client.on('connection', function (name, handshake) {
  console.log(handshake.id.toString('hex').slice(0, 5), ' joined channel', name)
})

window.emitter.on('greetings', function (message, id) {
  console.log('greetings : ' + id + ' > ' + message)
})

console.log('joined channel greetings')