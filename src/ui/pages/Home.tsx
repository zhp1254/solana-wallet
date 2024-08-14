import type { FC } from 'react';
import React from 'react';
import { useAccounts } from '../hooks/useAccounts';

export const Home: FC = () => {
    const accounts = useAccounts();

    return (
        <div>
            <h1>Solana Wallet</h1>
            <ul>
                
                    <li >
                       欢迎
                    </li>
            </ul>
        </div>
    );
};
