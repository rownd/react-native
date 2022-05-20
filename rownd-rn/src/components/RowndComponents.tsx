import React from 'react';
import { useDeviceContext } from 'twrnc';

import tw from '../utils/tailwind';
import { SignIn } from './SignIn';
import { useGlobalContext } from './GlobalContext';

export function RowndComponents() {
    const { state } = useGlobalContext();
    useDeviceContext(tw);

    return (
        <>
            {state.nav.current_route === '/account/login' && <SignIn />}
        </>
    )
}