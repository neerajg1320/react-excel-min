let ipcRenderer;

try {
  ipcRenderer = window.require('electron').ipcRenderer;
} catch (err) {

  const eventSender = (channel, arg) => {
    console.log(`stubEventSender: ${channel}: stub call`);
  };
  const addListener = (channel, arg) => {
    console.log(`addListener: ${channel}: stub call`);
  };
  const removeListener = (channel, arg) => {
    console.log(`removeListener: ${channel}: stub call`);
  };

  ipcRenderer = {
    on: addListener,
    once: addListener,
    send: eventSender,
    removeListener: removeListener,
    removeListeners: removeListener
  }
}

export const remoteCall = (channel, command) => {
  return new Promise((resolve, reject) => {
    // console.log(`remoteCall: command=${command}`);

    try {
      ipcRenderer.send(channel, command);
      ipcRenderer.once(channel, (event, response) => {
        // if (channel ===  "tally:command:vouchers:modify") {
        //   console.log(`remoteCall: command:response ${JSON.stringify(channel, null, 2)}`);
        //   console.log(`remoteCall: command:response ${JSON.stringify(response, null, 2)}`);
        // }
        if(!response.error) {
          resolve(response)
        } else {
          reject(response.error)
        }
      });
    } catch (e) {
      reject(e);
    }
  })
}

export const remoteMonitorStart = (channel, callback) => {
  ipcRenderer.on(channel, callback);
}

export const remoteMonitorStop = (channel, callback) => {
  ipcRenderer.removeListener(channel, callback);
}

export const removeListeners = () => {
  console.log('Removing Listeners');
  ipcRenderer.removeAllListeners();
}