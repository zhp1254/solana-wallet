import { SOLANA_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN } from '@solana/wallet-standard';
import nacl from "tweetnacl";
import EdDSA from "elliptic";
import BN from "bn.js";
import type {
    ConnectFeature,
    ConnectMethod,
    EventsFeature,
    EventsListeners,
    EventsNames,
    EventsOnMethod,
    Wallet,
    WalletAccount,
} from '@wallet-standard/core';
import { ETHEREUM_MAINNET_CHAIN } from '@wallet-standard/ethereum';
import bs58 from 'bs58';
import { utils as ethUtils } from 'ethers';
import type { RPC } from '../messages/index';
import { GPublicKey } from './publicKey';

import {Transaction, Keypair, PublicKey} from "@solana/web3.js"

export class EthereumWalletAccount implements WalletAccount {
    readonly #publicKey: Uint8Array;

    get address() {
        return ethUtils.computeAddress(this.publicKey);
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return [ETHEREUM_MAINNET_CHAIN] as const;
    }

    get features() {
        return ['experimental:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
        if (new.target === EthereumWalletAccount) {
            Object.freeze(this);
        }

        this.#publicKey = publicKey;
    }
}

export class SolanaWalletAccount implements WalletAccount {
    readonly #publicKey: Uint8Array;

    get address() {
        return bs58.encode(this.publicKey);
    }

    get publicKey() {
        return this.#publicKey.slice();
    }

    get chains() {
        return [SOLANA_MAINNET_CHAIN] as const;
    }

    get features() {
        return ['experimental:signTransaction'] as const;
    }

    constructor(publicKey: Uint8Array) {
        if (new.target === SolanaWalletAccount) {
            Object.freeze(this);
        }

        this.#publicKey = publicKey;
    }
}

export type MultiChainWalletAccount = EthereumWalletAccount | SolanaWalletAccount;

export class MultiChainWallet implements Wallet {
    #name = 'MultiChain Wallet';
    // TODO: Add image.
    #icon = 'data:image/svg+xml;base64,' as const;

    #accounts: MultiChainWalletAccount[] = [];

    readonly #listeners: { [E in EventsNames]?: EventsListeners[E][] } = {};

    #rpc: RPC;

    #publicKey :any;
    #priv :any;

    #EdDSA :any;
    #BN :any;
    #BS58: any;

    get publicKey() {
        return this.#publicKey;
    }

    get version() {
        return '1.0.0' as const;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return [ETHEREUM_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN] as const;
    }

    get features(): ConnectFeature & EventsFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
        };
    }

    get accounts() {
        return this.#accounts;
    }

    constructor(rpc: RPC) {
        if (new.target === MultiChainWallet) {
            Object.freeze(this);
        }

        this.#rpc = rpc;
        /* let priv = Buffer.from("", 'hex')
        let keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(priv))
        console.log(Buffer.from(keyPair.publicKey).toString("hex"))
        console.log(Buffer.from(keyPair.secretKey).toString("hex"))
        console.log(bs58.encode(keyPair.publicKey)) */
    }

    connect = async (options?: { onlyIfTrusted?: boolean }) => {
        // 调用metamask 获取 public
       return await this.#connect({silent: false})
    }

    disconnect = async ()=> {
        // 调用metamask 断开钱包连接
    }

    on = async (event, listener) => {
        // dapp 挂载回调事件， disconnect accountChanged
        console.log("solana onevent: ", event)
        this.#on(event, listener)
    }

    off = async (event, listener) => {
        // dapp 取消回调
        console.log("solana offevent: ", event)
        this.#off(event, listener)
    }

    #sign = async (message) => {
        const eddsa =  new EdDSA.eddsa("ed25519")
        const pub = eddsa.encodePoint(eddsa.g.mul(this.#priv))

        let r = eddsa.hashInt(this.#priv.toArray(), message);
        let R = eddsa.g.mul(r);
        let Rencoded = eddsa.encodePoint(R);


        let s_ = eddsa.hashInt(Rencoded, pub, message)
            .mul(this.#priv);
        let S = r.add(s_).umod(eddsa.curve.n);
        return eddsa.makeSignature({ R: R, S: S, Rencoded: Rencoded });
    }

    signIn = async (input) => {
        console.log("signIn: ", input)
        return []
    }

    signAndSendTransaction = async(tx, keys) => {
        console.log(tx, keys)
        return ""
    }

    signTransaction = async (tx: Transaction) => {
        try {
            console.log("signTransaction: ", tx)

            let transactionBuffer = tx.message.serialize();
            console.log(Buffer.from(transactionBuffer).toString("hex"))
            // let signature = (await this.#sign(transactionBuffer)).toBytes();
            const signature = await this.#rpc.callMethod('signTx', [tx.serialize()]);
            tx.addSignature(this.#publicKey, Buffer.from(signature));
            
            console.log("signTransaction: ", tx)
            return tx;
        } catch(e) {
            console.log(e)
        }
    }

    signAllTransactions = async (tx: Transaction) => {
        try {
            console.log("signAllTransactions: ", tx)

            let transactionBuffer = tx.message.serialize();
            let signature = (await this.#sign(transactionBuffer)).toBytes();
            tx.addSignature(this.#publicKey, Buffer.from(signature));
            
            console.log("signTransaction: ", tx)
            return tx;
        } catch(e) {
            console.log(e)
        }
    }

    signMessage = async (message: Uint8Array) => {
        const toHexString = function(fileData){
            var dataString = "";
            for (var i = 0; i < fileData.length; i++) {
              dataString += String.fromCharCode(fileData[i]);
            }
            return dataString
          }
        console.log("signMessage: ", toHexString(message))
        //const sig = (await this.#sign(message)).toBytes()
        const sig = await this.#rpc.callMethod('signMsg', [message]);
        console.log("sig: ", sig)
        return {
            signature: sig,
            publicKey: this.publicKey
        }
    }

    #connect: ConnectMethod = async ({ silent } = {}) => {
        const accounts = await this.#rpc.callMethod('connect');
        console.log("connect1345678========>")

        if (accounts === null) {
            throw new Error('The user rejected the request.');
        }

        this.#accounts = accounts.map((account: { network: string; publicKey: Uint8Array }) => {
            const { network, publicKey } = account;
            this.#publicKey = new PublicKey(publicKey)
            switch (network) {
                case 'ethereum':
                    return new EthereumWalletAccount(publicKey);
                case 'solana':
                    return  new SolanaWalletAccount(publicKey);
                default:
                    throw new Error(`Unknown network: '${network}'`);
            }
        });

        this.#emit('change', { accounts: this.accounts });

        return {
            accounts: this.accounts,
        };
    };

    #on: EventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends EventsNames>(event: E, ...args: Parameters<EventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends EventsNames>(event: E, listener: EventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }
}
