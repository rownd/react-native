import * as React from 'react';
import { TextInput, KeyboardAvoidingView, findNodeHandle } from 'react-native';
import { RegisterOptions, FieldError, UseFormSetValue, UseFormRegister, Controller, Control } from 'react-hook-form';

interface ValidationMap {
    [key: string]: RegisterOptions;
}

interface ErrorMap {
    [key: string]: FieldError | undefined;
}

interface Props {
    children: JSX.Element | JSX.Element[];
    register: UseFormRegister<any>;
    errors: ErrorMap;
    validation: ValidationMap;
    setValue: UseFormSetValue<any>
    control: Control<any>
}

export default ({
    register,
    errors,
    setValue,
    validation,
    children,
    control,
}: Props) => {
    const Inputs = React.useRef<Array<TextInput>>([]);

    // React.useEffect(() => {
    //     (Array.isArray(children) ? [...children] : [children]).forEach((child) => {
    //         if (child.props.name) {
    //             register(child.props.name, validation[child.props.name]);
    //         }
    //     });
    // }, [register]);

    return (
        <>
            {(Array.isArray(children) ? [...children] : [children]).map(
                (child, i) => {
                    return child.props.name
                        ? (<Controller
                            name={child.props.name}
                            control={control}
                            key={i}
                            render={({ field: { onChange, onBlur, value } }) => (React.createElement(child.type, {
                            ...{
                                ...child.props,
                                ref: (e: TextInput) => {
                                    Inputs.current[i] = e;
                                },
                                // onChangeText: (v: string) =>
                                //     setValue(child.props.name, v, { shouldValidate: true }),
                                onChangeText: onChange,
                                onSubmitEditing: () => {
                                    Inputs.current[i + 1]
                                        ? Inputs.current[i + 1].focus()
                                        : Inputs.current[i].blur();
                                },
                                onBlur,
                                blurOnSubmit: false,
                                //name: child.props.name,
                                error: errors[child.props.name],
                                value,
                                // ...register(child.props.name, validation[child.props.name]),

                            },
                        }))} />)
                        : child;
                }
            )}
        </>
    );
};
