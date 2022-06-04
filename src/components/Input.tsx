import * as React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { FieldError } from 'react-hook-form';
interface Props extends TextInputProps {
  name: string;
  label?: string;
  labelStyle?: TextStyle;
  error?: FieldError | undefined;
}

export default React.forwardRef<any, Props>(
  (props, ref): React.ReactElement => {
    const { label, labelStyle, error, ...inputProps } = props;

    // console.log(inputProps);

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        <TextInput
          autoCapitalize="none"
          ref={ref}
          style={[styles.input, { borderColor: error ? '#fc6d47' : '#c0cbd3' }]}
          {...inputProps}
        />
        <Text style={styles.textError}>{error && error.message}</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    // marginVertical: 8,
    // display: 'flex',
    // paddingVertical: 15,
  },
  input: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 5,
    paddingLeft: 5,
    fontSize: 16,
    height: 40,
    color: '#121212',
  },
  label: {
    // padding: 15,
    marginVertical: 5,
    fontSize: 16,
    fontWeight: 'bold',
    // color: '#c0cbd3',
    display: 'flex',
  },
  textError: {
    color: '#fc6d47',
    fontSize: 14,
  },
});
