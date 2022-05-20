import { TailwindProvider } from 'tailwind-rn';
import utilities from '../../../tailwind.json';
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
} from 'react-native';
import { SignIn } from './SignIn';
import { useGlobalContext } from './GlobalContext';

export function RowndComponents() {
    const { state, dispatch } = useGlobalContext();

    return (
        <TailwindProvider utilities={utilities}>
            {state.nav.current_route === '/account/login' && <SignIn />}
        </TailwindProvider>
    )
}