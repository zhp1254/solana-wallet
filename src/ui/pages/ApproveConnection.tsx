import type { FC } from 'react';
import React, { useState } from 'react';
import { condenseAddress } from '../../utils/address';
import { useAccounts } from '../hooks/useAccounts';
import { rpc } from '../rpc/index';
import { getSolanaAddress, getPublic } from '../../utils/account';

export type Network = 'ethereum' | 'solana';

export interface Account {
    network: Network;
    publicKey: Uint8Array;
}

let approveConnection: (accounts: Account[]) => void;
let denyConnection: () => void;
rpc.exposeMethod('connect', async () => {
    return new Promise((resolve) => {
        approveConnection = (accounts: Account[]) => {
            resolve(accounts);
        };
        denyConnection = () => {
            resolve(null);
        };
    });
});

export const ApproveConnection: FC = () => {
    //const accounts = useAccounts();

    const [selectedAccounts, setSelectedAccounts] = useState(new Map<string, Account>());
    const hasSelectedAccounts = selectedAccounts.size > 0;
    const [curAddr, setCurAddr] = useState("")
    const [curPriv, setCurPriv] = useState("")


    const handleAccountPrivInput = (priv: string) => {
        setCurPriv(priv)
        if (priv) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const address = getSolanaAddress(priv);
            setCurAddr(address)
            const pubKey = getPublic(priv);
            setSelectedAccounts((prevSelectedAccounts) => {
                prevSelectedAccounts.set(address, {
                    network: 'solana',
                    publicKey: pubKey,
                });
                return new Map(prevSelectedAccounts.entries());
            });
        } 
    };

    return (
        <div>
            <h1>Approve Connection</h1>
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
                        <label htmlFor="address-input">请输入私钥 {curAddr?curAddr: "--"}
                        </label>
                    </li>
            </ul>
            <div>
                <button type="button" onClick={denyConnection}>
                    Deny
                </button>
                <button
                    type="button"
                    onClick={() => approveConnection([...selectedAccounts.values()])}
                    disabled={!hasSelectedAccounts}
                >
                    Approve
                </button>
            </div>
        </div>
    );
};
