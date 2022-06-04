import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRownd } from "../../rownd-rn/src";
import tw from '../utils/tailwind';
import { HomeScreen } from './HomeScreen';
import { ProfileScreen } from './ProfileScreen';
import React from 'react';

const Tab = createBottomTabNavigator();

export default function () {
    const { requestSignIn, signOut, auth, user } = useRownd();


    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </NavigationContainer>
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