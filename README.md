minimum viable v1:

  api is content-protocol agnostic (could be hypercore, hyperdrive, something else...)
  publish to those listening to you and to those listening to ids for responses
  
  // review
  var sci = new Scientist()
  sci.publish(message)
    publish message to activity feed
  sci.respond(message_id, response) 
    publish auditable response
  sci.replicate(message_id)
    publish replicate message and begin replicating

  // messaging 
  var prp = new Peer()
  prp.on(id, onmessage)
    request messages from id and filter them
  prp.emit(id, data)
    retrieve message and deliver