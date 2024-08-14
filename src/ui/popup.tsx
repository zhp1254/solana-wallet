import type { FC } from 'react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppContext } from './context/index';
import { ApproveConnection } from './pages/ApproveConnection';
import { ApproveSignMsg } from './pages/SignMsg';
import { ApproveSignTx } from './pages/SignTx';
import { Home } from './pages/Home';

const Root: FC = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const isApproveConnection = queryParams.get('approveConnection') !== null;
    const isApproveSignMsg = queryParams.get('signMsg') !== null;
    const isApproveSignTx = queryParams.get('signTx') !== null;
    const Route = (()=>{
        if (isApproveConnection) {
            return ApproveConnection
        }

        if (isApproveSignMsg) {
            return ApproveSignMsg
        }

        if (isApproveSignTx) {
            return ApproveSignTx
        }
        return  Home;
    })()

    return (
        <StrictMode>
            <AppContext>
                <Route />
            </AppContext>
        </StrictMode>
    );
};

const rootNode = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(rootNode!);
root.render(<Root />);
