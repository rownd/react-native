import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useRownd } from "../../rownd-rn/src";
import { ActionType } from '../../rownd-rn/src/data/actions';
import tw from '../utils/tailwind';


export default function () {
    const { state, dispatch } = useRownd();
    
    const { auth } = state;

    const requestSignIn = () => {
        dispatch({
            type: ActionType.CHANGE_ROUTE,
            payload: {
                route: '/account/login',
            },
        });
    };

    const signOut = () => {
        dispatch({
            type: ActionType.SIGN_OUT,
        });
    }

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            {!auth.access_token && (
                <Pressable onPress={requestSignIn} style={tw.style('button')}>
                    <Text>Sign in with Rownd</Text>
                </Pressable>
            )}
            {auth.access_token && (
                <>
                    <Text>You are signed in as {state?.user?.data?.email}</Text>
                    <Pressable onPress={signOut} style={tw.style('button')}>
                        <Text>Sign out</Text>
                    </Pressable>
                </>
            )}
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});