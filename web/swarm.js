var PeerEmitter = require('./')

window.onload = function () {

  var _ = require('yo-yo')

  var peer = window.peer = new PeerEmitter()
  window._ = _

  var messages = []
  var el = _messages()

  _update('your name is ' + peer.keyPair.publicKey.toString('hex').slice(0, 5))
  _update('you\'ve joined channel greetings')

  peer.client.on('connection', function (name, id) {
    _update(id.toString('hex').slice(0, 5) + ' joined channel ' + name)
  })

  peer.on('greetings', function (message, id) {
    _update(id.slice(0, 5) + ' > ' + message)
  })

  function _messages (messages) {
    return _`<div>
      <ul>
        ${(messages || []).map(function (message) { return _`<li>${message}</li>` })}
      </ul>
    </div>`
  }

  function _update (message) {
    if (message) messages.push(message)
    _.update(el, _messages(messages))
  }

  // input
  var input = _`<input type="text" onkeydown=${onkeydown}>`

  function onkeydown (event) {
    if (event.keyCode == 13) { 
      peer.emit('greetings', this.value)
      _update(this.value)
      this.value = ''
    }
  }

  document.body.appendChild(input)
  document.body.appendChild(el)
}