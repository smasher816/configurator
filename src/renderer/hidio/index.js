import * as capnp from 'capnp';
//var capnp = require('capnp');

//var common_schema = capnp.import(__dirname + '../../../../schema/common.capnp');
//var devicefunction_schema = capnp.import(__dirname + '../../../../schema/devicefunction.capnp');
var hidio_schema = capnp.import(__dirname + '../../../../schema/hidio.capnp');
//var hidiowatcher_schema = capnp.import(__dirname + '../../../../schema/hidiowatcher.capnp');
//var hostmacro_schema = capnp.import(__dirname + '../../../../schema/hostmacro.capnp');
//var usbkeyboard_schema = capnp.import(__dirname + '../../../../schema/usbkeyboard.capnp');

export function hidioConnect() {
  var conn = capnp.connect('localhost:7185');
  var hidio_server = conn.restore('exportName', hidio_schema.HIDIOServer);
  var hidio = hidio_server.basic(null).then(resp => {
    return {
      connection: conn,
      cap: hidio_server,
      instance: resp.port,
    };
  });
  console.log('foobar');
  return hidio;
}

export function getNodes(hidio) {
  //return Promise.resolve([hidio]);
  return hidio
    .nodes()
    .then(resp => {
      console.log(resp);
      return resp.nodes;
    })
    .catch(e => {
      console.log(e);
    });
}

export function registerNode(endpoint) {
  return endpoint.node.register().then(resp => {
    if (resp.ok) {
      return endpoint;
    }
    return Promise.reject(new Error('Could not register to node'));
  });
}

export function sendCmd(node, cmd) {
  node.commands.usbKeyboard.cliCommand(cmd + '\n');
  console.log('Sending cmd:', cmd);
}

export function getSignal(hidio) {
  return hidio.signal().then(resp => {
    resp.signal.forEach(signal => {
      if (signal.type['hidioPacket']) {
        var packet = signal.type.hidioPacket;
        if (packet['devicePacket']) {
          let id = packet.devicePacket.id;
          let data = packet.devicePacket.data;
          if (id == 0x22) {
            let s = '';
            data.forEach(c => {
              s += String.fromCharCode(c);
            });
            console.log('[TERM] ', s);
            return s;
          }
        }
      } else {
        console.log(signal.type);
      }
    });
  });
}

export async function hidioTest() {
  var hidio = await hidioConnect();
  var nodes = await getNodes(hidio);

  nodes.forEach(n => {
    console.log('Node ' + n.id + ': [' + n.type + '] ' + n.name + ' (' + n.serial + ')');
  });
  /*var node = await registerNode(nodes[0]);
  await sendCmd(node, 'version');

  while (hidio) {
    await getSignal(hidio).catch(e => {
      if (e == 'Error: RpcSystem was destroyed.' || e == 'Error: Peer disconnected.') {
        hidio = null;
      } else if (e == 'Error: remote exception: No data') {
        // ignore
      } else {
        console.log(e);
      }
    });
  }*/
}
