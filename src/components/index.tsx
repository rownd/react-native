import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabNavigationProp, BottomTabScreenProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useRownd } from "../../rownd-rn/src";
import tw from '../utils/tailwind';
import { HomeScreen } from './HomeScreen';
import { ProfileScreen } from './ProfileScreen';
import React, { useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeProvider, createTheme, lightColors, darkColors } from '@rneui/themed';

const { Gravatar, GravatarApi } = require('react-native-gravatar');

type RootStackParamList = {
    Home: undefined;
    Profile: undefined;
};

type ScreenProp = BottomTabNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator<RootStackParamList>();

const rowndTheme = createTheme({
    Button: {
        color: '#5b0ae0',
    },
    lightColors: {
        ...Platform.select({
            default: lightColors.platform.android,
            ios: lightColors.platform.ios,
        }),
    },
    darkColors: {
        ...Platform.select({
            default: darkColors.platform.android,
            ios: darkColors.platform.ios,
        }),
        primary: '#5b0ae0',
    }
});

const ProfileButton = () => {
    const { requestSignIn, signOut, is_authenticated, auth, user } = useRownd();
    const navigation = useNavigation<ScreenProp>();

    const onProfilePress = useCallback(() => {
        if (!is_authenticated) {
            requestSignIn();
        } else {
            navigation.jumpTo('Profile');
        }
    }, [is_authenticated]);

    return (
        <Pressable onPress={() => onProfilePress()} style={styles.accountIcon}>
            {!is_authenticated && <MaterialIcons name="account-circle" size={32} color="#5b0ae0" />}
            {is_authenticated && <Gravatar options={{
                email: user.data?.email,
                parameters: { "size": "64", "d": "mp" },
                secure: true
            }}
                style={styles.roundedProfileImage} />}
        </Pressable>
    );
}

export default function () {
    const { requestSignIn, signOut, auth, user } = useRownd();

    const defaultScreenOptions = ({ route }: BottomTabScreenProps<RootStackParamList>) => ({
        headerRight: () => (
            <ProfileButton />
        ),
        tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof MaterialIcons.glyphMap;
            switch (route.name) {
                case 'Home':
                    iconName = 'home';
                    break;

                case 'Profile':
                    iconName = 'account-box';
                break;
            }

            return <MaterialIcons name={iconName} size={size} color={color} />
        }
    } as BottomTabNavigationOptions);

    return (
        <ThemeProvider theme={rowndTheme}>
            <NavigationContainer>
                <Tab.Navigator screenOptions={defaultScreenOptions}>
                    <Tab.Screen name="Home" component={HomeScreen} />
                    <Tab.Screen name="Profile" component={ProfileScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </ThemeProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountIcon: {
        marginRight: 10,
        height: 32,
        width: 32,
    },
    roundedProfileImage: {
        borderColor: 'white',
        borderRadius: 50,
        height: 32,
        width: 32,
    }
});