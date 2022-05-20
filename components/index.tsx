import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useRownd } from "../rownd-rn/src";
import { ActionType } from '../rownd-rn/src/data/actions';


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

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            {!auth.access_token && (
                <Pressable onPress={requestSignIn} style={styles.button}>
                    <Text>Sign in with Rownd</Text>
                </Pressable>
            )}
            {auth.access_token && (
                <Text>You are signed in as {state?.user?.data?.email}</Text>   
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
    },
    button: {
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        marginBottom: 30,
        elevation: 0,
        backgroundColor: '#999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});