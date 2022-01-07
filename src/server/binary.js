ws.binaryType = "arraybuffer"

const msgpack = require("msgpack-lite");


ws.send(msgpack.encode({
  foo: 'bar'
}))

const data = msgpack.decode(new Uint8Array(incoming packet));