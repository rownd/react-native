import React, { memo, useCallback, forwardRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { BottomSheetTextInputProps } from './types';

// @ts-ignore
const {
  useBottomSheetInternal,
} = require('@gorhom/bottom-sheet/src/hooks/useBottomSheetInternal');

const BottomSheetTextInputComponent = forwardRef<
  TextInput,
  BottomSheetTextInputProps
>(({ onFocus, onBlur, ...rest }, ref) => {
  //#region hooks
  // @ts-ignore
  let { shouldHandleKeyboardEvents } = useBottomSheetInternal();
  //#endregion

  if (!shouldHandleKeyboardEvents) {
    shouldHandleKeyboardEvents = {};
  }

  //#region callbacks
  const handleOnFocus = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents]
  );
  const handleOnBlur = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents]
  );
  //#endregion

  return (
    <TextInput
      ref={ref}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      {...rest}
    />
  );
});

const BottomSheetTextInput = memo(BottomSheetTextInputComponent);
BottomSheetTextInput.displayName = 'BottomSheetTextInput';

export default BottomSheetTextInput;
