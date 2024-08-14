import { registerWallet } from '@wallet-standard/core';
import { createRPC, createWindowTransport } from '../messages/index';
import { MultiChainWallet } from './multiChainWallet';

function register(): void {
    const transport = createWindowTransport(window);
    const rpc = createRPC(transport);
    let wt = new MultiChainWallet(rpc)
    registerWallet(wt);
    try {
        Object.defineProperty(window, 'solflare', { value: {isSolflare: true} });
        Object.defineProperty(window, 'solana', { value: {isPhantom: true} });
        Object.defineProperty(window, 'phantom', { value: {solana: wt} });
    }
    catch (error) {
        console.error("solflare: ", error);
    }
}

register();
