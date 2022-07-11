import {
    Text,
    View,
    TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React from 'react';

type FormFieldProps = {
    id?: string;
    name: string;
    value?: string;
    type?: string;
    label?: string;
    placeholder?: string;
    options?: [{
        value: string;
        label: string;
    }] | null;
    onChange?: (value: string) => void;
}

export function renderField({ id, label = '', name, type = 'input', value, placeholder, options = null, onChange }: FormFieldProps) {
    const dom = [];

    if (!id) {
        id = `rph-input-${name}`;
    }

    return (
        <>
            {label && <Text>{label}</Text>}

            {type === 'select' && (
                <Picker onValueChange={onChange} selectedValue={value || options?.[0]?.value}>
                    {options?.map((opt) => <Picker.Item value={opt.value} key={opt.value}> {opt.label} </Picker.Item>)}
                </Picker>
            )}

            {type === 'input' && (
                <TextInput value={value} placeholder={placeholder} onChangeText={onChange} />
            )}
        </>
    );
}