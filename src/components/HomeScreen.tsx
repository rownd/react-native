import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRownd } from "../../rownd-rn/src";
import tw from '../utils/tailwind';
import React from 'react';

export function HomeScreen() {
    const { requestSignIn, signOut, auth, user } = useRownd();


    return (
        <View style={styles.container}>
            {/* <Text>Open up App.tsx to start working on your app!</Text> */}
            {!auth.access_token && (
                <Pressable onPress={() => requestSignIn()} style={tw.style('button')}>
                    <Text style={tw.style('buttonContent')}>Sign in with Rownd</Text>
                </Pressable>
            )}
            {auth.access_token && (
                <>
                    <Text>You are signed in as {user?.data?.email}</Text>
                    <Pressable onPress={signOut} style={tw.style('button')}>
                        <Text style={tw.style('buttonContent')}>Sign out</Text>
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