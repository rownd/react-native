import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useForm } from 'react-hook-form';
import { useIsFocused } from '@react-navigation/native';

import Input from './Input';
import Form from './Form';
import validation from '../utils/validation';
import React from 'react';
import { AuthenticatedComponent, useRownd } from '../../rownd-rn/src';

type FormData = {
    first_name?: string;
    last_name?: string;
    email: string | null;
    phone: string | null;
};

export function ProfileScreen() {
    const isFocused = useIsFocused();

    const { user } = useRownd();
    const { handleSubmit, register, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues: user.data
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
        user.set(data);
    };

    return (
        <AuthenticatedComponent shouldRequestSignIn={isFocused} renderContentWhenUnauthenticated={true}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}>
                <View style={styles.container}>
                    <Text style={styles.title}>Update your profile!</Text>
                    <View style={styles.formContainer}>
                        <Form {...{ register, setValue, validation, errors }}>
                            <Input name="first_name" label="First name" autoCapitalize='words' defaultValue={user.data.first_name} />
                            <Input name="last_name" label="Last name" autoCapitalize='words' defaultValue={user.data.last_name} />
                            <Input name="email" label="Email" keyboardType="email-address" autoCorrect={false} spellCheck={false} defaultValue={user.data.email || ''} />
                            <Input name="phone_number" label="Phone number" keyboardType="phone-pad" defaultValue={user.data.phone_number} />
                            <Button title="Save" onPress={handleSubmit(onSubmit)} />
                        </Form>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </AuthenticatedComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'center',
        // paddingTop: Constants.statusBarHeight,
        // backgroundColor: '#181e34',
        backgroundColor: '#efefef',
        padding: 5,
    },
    title: {
        fontSize: 20,
        paddingBottom: 10,
    },
    formContainer: {
        padding: 8,
        flex: 1,
    },
    button: {
        backgroundColor: 'red',
    },
});
