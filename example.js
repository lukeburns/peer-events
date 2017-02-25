#!/usr/bin/env node
var PeerEmitter = require('./')

var emitter = new PeerEmitter()
console.log('Your name is:', shorten(emitter.keyPair.publicKey.toString('hex')))
console.log('To open the greetings channel, type \'greetings\'')
console.log('To send \'hello world\' to emitters on \'greetings\', type \'greetings : hello world\'')

process.stdin.on('data', function (data) {
  var split = data.toString().split(':'),
      channel = split[0].trim(),
      msg = (split[1] || '').trim()

  emitter.emit(channel, msg)

  if (!emitter.local._events[channel]) {
    emitter.on(channel, function (message, id) {
      if (message.length > 0)
        console.log(channel, ':', shorten(id), '>', message.toString())
    })
  }
})

emitter.local.on('connection', function (name, id) {
  console.log(shorten(id), 'joined channel', name)
})

function shorten (key) {
  return key.toString('hex').slice(0, 5)
}

// thank you substack
var encode = function (xs) {
    function bytes (s) {
        if (typeof s === 'string') {
            return s.split('').map(ord)
        }
        else if (Array.isArray(s)) {
            return s.reduce(function (acc, c) {
                return acc.concat(bytes(c))
            }, [])
        }
    }
    
    return new Buffer([ 0x1b ].concat(bytes(xs)))
}

var ord = encode.ord = function ord (c) {
    return c.charCodeAt(0)
}