import type { FC } from 'react';
import React, { useState } from 'react';
import { condenseAddress } from '../../utils/address';
import { useAccounts } from '../hooks/useAccounts';
import { rpc } from '../rpc/index';
import { getSolanaAddress, getPublic, sign } from '../../utils/account';

export type Network = 'ethereum' | 'solana';


let approveSignMsg: (_priv: string) => void;
let denySignMsg: () => void;
let setSignData : any;
rpc.exposeMethod('signMsg', async (data) => {
    console.log("page sign msg data: ", data)
    return new Promise((resolve) => {
        setSignData(data[0]);
        approveSignMsg = (_priv: string) => {
            const _signature = sign(_priv, data[0])
            resolve(_signature);
        };
        denySignMsg = () => {
            resolve(null);
        };
    });
});

const toHexString = function(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
      dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
  }

export const ApproveSignMsg: FC = (msg) => {
    const [curAddr, setCurAddr] = useState("")
    const [curPriv, setCurPriv] = useState("")
    const [curMsg, setCurMsg] = useState(new Uint8Array)
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
            <h1>Approve Sign</h1>
            <h6>
                {toHexString(curMsg)}
            </h6>
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
                <button type="button" onClick={denySignMsg}>
                    Deny
                </button>
                <button
                    type="button"
                    onClick={() => approveSignMsg(curPriv)}
                    disabled={!curPriv}
                >
                    Approve
                </button>
            </div>
        </div>
    );
};
