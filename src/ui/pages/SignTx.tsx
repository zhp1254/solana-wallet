import type { FC } from 'react';
import React, { useState } from 'react';
import { condenseAddress } from '../../utils/address';
import { useAccounts } from '../hooks/useAccounts';
import { rpc } from '../rpc/index';
import { getSolanaAddress, getPublic, sign } from '../../utils/account';
import {VersionedTransaction} from "@solana/web3.js"
import { stringify } from '../../messages/serialization';

export type Network = 'ethereum' | 'solana';

let approveSignTx: (_priv: string) => void;
let denySignTx: () => void;
let setSignData : any;
rpc.exposeMethod('signTx', async (data) => {
    console.log("page sign tx data: ", data)
    return new Promise((resolve) => {
        let tx = VersionedTransaction.deserialize(data[0])
        console.log(tx)
        let transactionBuffer = tx.message.serialize();
        console.log(Buffer.from(transactionBuffer).toString("hex"))
        console.log(Buffer.from(tx.serialize()).toString("hex"))

        setSignData(JSON.stringify(tx));
        approveSignTx = (_priv: string) => {
            const _signature = sign(_priv, transactionBuffer)
            resolve(_signature);
        };
        denySignTx = () => {
            resolve(null);
        };
    });
});

export const ApproveSignTx: FC = () => {
    //const accounts = useAccounts();

    const [curAddr, setCurAddr] = useState("")
    const [curPriv, setCurPriv] = useState("")
    const [curMsg, setCurMsg] = useState("[]")
    setSignData = setCurMsg;

    const handleAccountPrivInput = (priv: string) => {
        setCurPriv(priv)
        if (priv) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const address = getSolanaAddress(priv);
            setCurAddr(address)
            const pubKey = getPublic(priv);
        } 
    };

    return (
        <div>
            <h1>Approve sign transaction</h1>
            <ul>
                    <li >
                        <input
                            type="text"
                            id="address-input"
                            onChange={(event) => {
                                const priv = event.target.value;
                                handleAccountPrivInput(priv);
                            }}
                            value={curPriv}
                        />
                        <label htmlFor="address-input"> {curAddr?curAddr: "请输入私钥: "}
                        </label>
                    </li>
            </ul>
            <div>
                <button type="button" onClick={denySignTx}>
                    Deny
                </button>
                <button
                    type="button"
                    onClick={() => approveSignTx(curPriv)}
                    disabled={!curPriv}
                >
                    Approve
                </button>
            </div>
            <pre>
            </pre>
        </div>
    );
};
