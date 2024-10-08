type Callback = (...args: any[]) => void;

export interface Transport {
    addListener: (listener: Callback) => void;
    removeListener: (listener: Callback) => void;
    write: (data: any) => void;
}

export function createPortTransport(port: chrome.runtime.Port): Transport {
    return {
        addListener: (listener) => port.onMessage.addListener(listener),
        removeListener: (listener) => port.onMessage.removeListener(listener),
        write: (data) => {
            //console.log("port send message: ", data, port)
            return port.postMessage(data)
        },
    };
}

export function createWindowTransport(window: Window): Transport {
    return {
        addListener: (listener) => window.addEventListener('message', listener),
        removeListener: (listener) => window.removeEventListener('message', listener),
        write: (data) => {
            //console.log("window send message: ", data)
            return window.postMessage(data)
        },
    };
}
