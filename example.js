#!/usr/bin/env node
var PeerEmitter = require('.')

var peer = new PeerEmitter()

console.log('To open the greetings channel, type \'greetings\'')
console.log('To send \'hello world\' to peers on \'greetings\', type \'greetings : hello world\'')

process.stdin.on('data', function (data) {
  var split = data.toString().split(':'),
      channel = split[0].trim(),
      msg = (split[1] || '').trim()

  peer.emit(channel, msg)

  if (!peer.client._events[channel]) {
    peer.on(channel, function (message) {
      console.log(channel, ':', message.toString())
    })
  }
})

peer.client.on('connection', function () {
  console.log(': new connection')
})

function id (key) {
  return key.toString('hex').slice(0, 5)
}