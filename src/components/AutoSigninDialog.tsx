import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import bottomSheetMeta from '@gorhom/bottom-sheet/package.json';
import { useTimeout } from 'usehooks-ts';

import { useNav } from '../hooks';
import { useGlobalContext } from './GlobalContext';

import ErrorIcon from './images/ErrorIcon';

export function AutoSigninDialog() {
  const navTo = useNav();
  const { state } = useGlobalContext();

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
  }, []);

  const handleClose = useCallback(() => {
    setTimeout(() => {
      navTo({ hide: true });
    }, 150);
  }, [navTo]);

  const snapPoints = useMemo(() => ['30%', '60%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} pressBehavior="none" />
    ),
    []
  );

  let extraBottomSheetProps: any = {};
  if (bottomSheetMeta.version.startsWith('4')) {
    extraBottomSheetProps.keyboardBehavior = 'fillParent';
    extraBottomSheetProps.android_keyboardInputMode = 'adjustResize';
    extraBottomSheetProps.enablePanDownToClose =
      state.nav.options.type === 'error';
  }

  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      index={0}
      backdropComponent={renderBackdrop}
      onDismiss={handleClose}
      style={styles.bottomSheet}
      ref={bottomSheetModalRef}
      {...extraBottomSheetProps}
    >
      <View style={styles.innerContainer}>
        {state.nav.options.type === 'error' && (
          <>
            <ErrorIcon />
            <Text style={styles.errorMessage}>
              {state.nav.options.message ||
                'An error occurred. Please try again.'}
            </Text>
          </>
        )}

        {state.nav.options.type === 'sign-in' && (
          <>
            <ActivityIndicator size="large" color="#5b0ae0" />
            <Text style={styles.signInMessage}>
              Automatically signing you in. Just a sec...
            </Text>
          </>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    // flex: 1,
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

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
    color: '#DA1E28',
    height: 24,
    width: 24,
  },
});
