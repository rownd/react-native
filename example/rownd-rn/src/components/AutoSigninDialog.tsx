import { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTimeout } from 'usehooks-ts';
import { MaterialIcons } from '@expo/vector-icons'; 

import { useNav } from '../hooks';
import { useGlobalContext } from './GlobalContext';

export function AutoSigninDialog() {
    const navTo = useNav();
    const { state, dispatch } = useGlobalContext();

    // Let the user know they're auto signing-in, then close when done
    useTimeout(() => {
        if (state.nav.options.type === 'error') {
            return;
        }

        handleClose();
    }, 3000);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    useEffect(() => {
        if (bottomSheetModalRef.current) {
            bottomSheetModalRef.current.present();
        }
    }, [bottomSheetModalRef.current]);

    const handleClose = useCallback(() => {
        setTimeout(() => {
            navTo({ hide: true });
        }, 150);
    }, []);

    const snapPoints = useMemo(() => ['30%', '60%'], []);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} pressBehavior="none" />
        ),
        []
    );

    return (
        <BottomSheetModal
            snapPoints={snapPoints}
            index={0}
            backdropComponent={renderBackdrop}
            keyboardBehavior="fillParent"
            android_keyboardInputMode="adjustResize"
            enablePanDownToClose={state.nav.options.type === 'error'}
            onDismiss={handleClose}
            style={styles.bottomSheet}
            ref={bottomSheetModalRef}
        >
            <View style={styles.innerContainer}>
                {state.nav.options.type === 'error' &&
                    <>
                        <MaterialIcons name="error" size={24} color="#DA1E28" style={styles.errorIcon} />
                        <Text style={styles.errorMessage}>
                            {state.nav.options.message || 'An error occurred. Please try again.'}
                        </Text>
                    </>
                }

                {state.nav.options.type === 'sign-in' &&
                    <>
                        <ActivityIndicator size="large" color="#5b0ae0" />
                        <Text style={styles.signInMessage}>
                            Automatically signing you in. Just a sec...
                        </Text>
                    </>
                }
            </View>

        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    modal: {
        // flex: 1,
    },
    bottomSheet: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,

        elevation: 24,
    },
    innerContainer: {
        borderRadius: 20,
        borderColor: 'transparent',
        borderWidth: 0,
        padding: 25,
        textAlign: 'center',
    },
    signInMessage: {
        textAlign: 'center',
        fontSize: 24,
        padding: 20,
    },
    errorMessage: {
        textAlign: 'center',
        fontSize: 24,
        padding: 20,
    },
    errorIcon: {
        textAlign: 'center',
    }
});