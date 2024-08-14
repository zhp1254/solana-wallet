import { CONTENT_PORT_NAME } from '../messages/ports';
import { inject } from './utils';

const windowScript = new URL('./window.ts', import.meta.url);
inject(windowScript.href).then(function(){
    console.log('loand window.ts end')
});
console.log('wallet content inject=>>>>>>>>>>>>>>>>')
// Proxy messages between website and background process.
const port = chrome.runtime.connect({ name: CONTENT_PORT_NAME });
window.addEventListener('message', (event) => {
    //console.log("window message send to port: ", event, port)
    port.postMessage(event.data);
});
port.onMessage.addListener((message) => {
    console.log("port message send window: ", message)
    window.postMessage(message);
});
