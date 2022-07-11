import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { differenceInMinutes } from 'date-fns';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Text,
} from 'react-native';
// import Text from './DarkText';
import { SvgCssUri } from 'react-native-svg';
import tw from '../utils/tailwind';
import phone, { PhoneResult } from 'phone';
import jwt_decode from 'jwt-decode';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import BottomSheetTextInput from './BottomSheetTextInput';
import bottomSheetMeta from '@gorhom/bottom-sheet/package.json';

import { useApi, useInterval, useNav, useDeviceFingerprint } from '../hooks';
import { useGlobalContext } from './GlobalContext';
import { ActionType } from '../data/actions';
import { renderField } from '../utils/form';

// Image imports
import ImageEmailVerifyWaiting from './images/EmailVerifyWaiting';
import ImagePhoneVerifyWaiting from './images/PhoneVerifyWaiting';
import ImageCheckmarkFilled from './images/CheckmarkFilled';

enum LoginStep {
  INIT = 'init',
  WAITING = 'waiting',
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

type LoginInitBody = {
  challenge_id: string;
  message: string;
  auth_tokens?: {
    access_token: string;
    refresh_token: string;
  };
  registration_status: string;
  init_data?: Record<string, any>;
};

type LoginSuccessBody = {
  access_token: string;
  refresh_token: string;
  app_user_id: string;
  app_id: string;
  status: string;
};

enum LoginVerificationStatus {
  PENDING = 'pending',
  EXPIRED = 'expired',
  VERIFIED = 'verified',
}

export function SignIn() {
  const navTo = useNav();
  const { getFingerprint, getChallengeIfPresent, clearFingerprint } =
    useDeviceFingerprint();
  const { state, dispatch } = useGlobalContext();
  const { config, nav, app, user } = state;

  let decodedAccessToken: any;
  if (state.auth.access_token) {
    decodedAccessToken = jwt_decode(state.auth.access_token);
  }

  const [userIdentifier, setUserIdentifier] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [step, setStep] = useState(
    state.auth.access_token &&
      decodedAccessToken?.['https://auth.rownd.io/is_verified_user'] !== false
      ? LoginStep.SUCCESS
      : LoginStep.INIT
  );
  const [error, setError] = useState('');
  const allowedIdentifiers = useMemo(() => ['email', 'phone'], []);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loginPollStart, setLoginPollStart] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_phoneDetails, setPhoneDetails] = useState<PhoneResult | null>(null); // TODO: For parity with web, need to use `phoneDetails` to update the input visuals
  const [isValidUserIdentifier, setIsValidUserIdentifier] = useState(false);
  const [requiresAdditionalFields, setRequiresAdditionalFields] = useState(
    nav?.options?.init_data
  );

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  const addlFieldInit = useCallback(
    (currentState: Record<string, string>) => {
      const addlFields = app?.config?.hub?.auth?.additional_fields;
      const addlInputs =
        nav?.options?.init_data || nav?.options?.default_values || {};

      const newState: Record<string, string> = {};
      if (addlFields?.length) {
        for (const field of addlFields) {
          if (field?.options) {
            newState[field.name] =
              addlInputs?.[field.name] || field.options[0].value;
          }
        }
      }

      return {
        ...currentState,
        ...newState,
      };
    },
    [
      app?.config?.hub?.auth?.additional_fields,
      nav?.options?.default_values,
      nav?.options?.init_data,
    ]
  );

  const fieldReducer = useCallback(
    (
      currentState: any,
      action: { type: string; payload?: Record<string, string> }
    ) => {
      console.log('fieldReducer', action);
      switch (action.type) {
        case 'reset':
          return addlFieldInit(currentState);

        default:
          return {
            ...currentState,
            ...action.payload,
          };
      }
    },
    [addlFieldInit]
  );

  const [addlFieldValues, addlFieldDispatch] = useReducer(
    fieldReducer,
    {},
    addlFieldInit
  );

  const { client: api } = useApi();

  function validateEmail(email: string): boolean {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = re.test(String(email).toLowerCase());

    if (!isValid) {
      setFieldError('Invalid email address');
      return false;
    }

    setFieldError(null);
    return true;
  }

  const isValidPhone = useCallback((): boolean => {
    const phoneResult = phone(userIdentifier);
    if (!phoneResult.isValid) {
      setLoginType(null);
      setPhoneDetails(null);
      return false;
    }

    setLoginType('phone');
    setPhoneDetails(phoneResult);
    setUserIdentifier(phoneResult.phoneNumber);
    return true;
  }, [userIdentifier]);

  const isValidEmail = useCallback((): boolean => {
    const emailAtIdx = userIdentifier?.indexOf('@');
    const emailSuffixIdx = userIdentifier?.substring(emailAtIdx).indexOf('.');
    if (
      emailAtIdx > 0 &&
      emailSuffixIdx > 0 &&
      userIdentifier?.substring(emailAtIdx + emailSuffixIdx).length >= 3
    ) {
      return validateEmail(userIdentifier);
    }

    return false;
  }, [userIdentifier]);

  const validateInput = useCallback(() => {
    const validations = [];
    if (allowedIdentifiers.includes('phone')) {
      validations.push(isValidPhone);
    }

    if (allowedIdentifiers.includes('email')) {
      validations.push(isValidEmail);
    }

    if (!validations.some((fn) => fn())) {
      setIsValidUserIdentifier(false);
    } else {
      setIsValidUserIdentifier(true);
    }
  }, [allowedIdentifiers, isValidEmail, isValidPhone]);

  // Fire validation as data changes in field
  useEffect(validateInput, [validateInput]);

  const pollLoginStatus = useCallback(async () => {
    try {
      const resp: LoginSuccessBody = await api
        .post(`hub/auth/challenge_status`, {
          headers: {
            'x-rownd-app-key': config?.appKey,
          },
          json: {
            challenge_id: requestId,
            [loginType === 'phone' ? 'phone' : 'email']: userIdentifier,
          },
        })
        .json();

      let err: any;
      switch (resp.status) {
        case 'pending':
          err = new Error('Login challenge is still pending');
          err.code = LoginVerificationStatus.PENDING;
          throw err;

        case 'expired':
          err = new Error('Login challenge is still pending');
          err.code = LoginVerificationStatus.PENDING;
          throw err;

        case 'verified':
          break;

        default:
          err = new Error('Unknown login challenge status');
          throw err;
      }

      dispatch({
        type: ActionType.LOGIN_SUCCESS,
        payload: resp,
      });

      setStep(LoginStep.SUCCESS);
    } catch (err: any) {
      // logger.log('login poll error', err);

      // If network error, try again up to 1 minute, else fail
      if (!err.code && differenceInMinutes(Date.now(), loginPollStart!) > 0) {
        setStep(LoginStep.ERROR);
        setError('Network error. Please try again later.');
        return;
      }

      // If request expires, then fail (assume > 6 mins is a failure/expiration)
      if (
        (err.status || err.code) &&
        differenceInMinutes(Date.now(), loginPollStart!) > 6
      ) {
        setStep(LoginStep.ERROR);
        setError('The sign in request expired.');
        return;
      }

      if (err.status && err.status >= 400) {
        setStep(LoginStep.FAILURE);
        setError('Sign in unsuccessful.');
      }
    }
  }, [
    api,
    config?.appKey,
    dispatch,
    loginPollStart,
    loginType,
    requestId,
    userIdentifier,
  ]);

  // Polling when a login flow is in progress
  useInterval(pollLoginStatus, step === LoginStep.WAITING ? 5000 : null);

  // login polling manager
  useEffect(() => {
    if (step === LoginStep.SUCCESS) {
      if (nav?.options?.post_login_redirect || state.config?.postLoginUrl) {
        Linking.openURL(
          nav?.options?.post_login_redirect || state.config?.postLoginUrl
        );
      }

      dispatch({
        type: ActionType.CHANGE_ROUTE,
        payload: {
          route: '/',
        },
      });

      // Reset modal state if this user is unverified, since we'll need to re-submit at some point
      if (!state.auth.is_verified_user) {
        setStep(LoginStep.INIT);
      }
    }
  }, [
    dispatch,
    nav?.options?.post_login_redirect,
    pollLoginStatus,
    state.auth.is_verified_user,
    state.config?.postLoginUrl,
    step,
  ]);

  const initSignIn = useCallback(async () => {
    if (step === LoginStep.WAITING) {
      return;
    }

    // Validation
    if (fieldError) {
      return;
    }

    const payload = {
      [loginType === 'phone' ? 'phone' : 'email']: userIdentifier,
      return_url:
        nav?.options?.post_login_redirect || state.config?.postLoginUrl,
      user_data: Object.values(user.data).some(
        (f) => f !== null && f !== undefined
      )
        ? user.data
        : {}, // Include user.data if at least one field is defined
    };

    // Set the user_id to the application's default user id format if it is defined
    if (app.config?.default_user_id_format) {
      payload.user_id = app.config?.default_user_id_format;
    }

    if (requiresAdditionalFields) {
      payload.user_data = {
        ...payload.user_data,
        ...addlFieldValues,
      };
    }

    // Submission
    try {
      setIsSubmitting(true);

      // Get the browser fingerprint for future sign-ins that don't require re-verification
      const fingerprint = await getFingerprint();
      const challengeEntry = await getChallengeIfPresent(app.id, [
        userIdentifier,
      ]);
      payload.fingerprint = {
        hash: fingerprint.visitorId,
        challenge: challengeEntry?.value,
      };

      const resp: LoginInitBody = await api
        .post('hub/auth/init', {
          headers: {
            'x-rownd-app-key': config?.appKey,
          },
          json: payload,
        })
        .json();

      // This will only be true when a user is signing in for the very first time and
      // the app allows unverified users OR the user was successfully fingerprinted.
      if (resp.auth_tokens) {
        dispatch({
          type: ActionType.LOGIN_SUCCESS,
          payload: {
            ...resp.auth_tokens,
            app_id: app.id,
          },
        });

        setStep(LoginStep.SUCCESS);
        return;
      } else if (payload?.fingerprint?.challenge) {
        // The fingerprint is probably expired, so delete the challenge for re-registration
        try {
          clearFingerprint(payload.fingerprint.challenge);
        } catch (err) {
          // no-op, but not likely to throw anyway
        }
      }

      setRequestId(resp.challenge_id);
      setStep(LoginStep.WAITING);
      setLoginPollStart(Date.now());
    } catch (err: any) {
      // logger.error(err);

      if (err.response.status === 400) {
        setStep(LoginStep.INIT);
        setRequiresAdditionalFields(true);
        return;
      }

      setStep(LoginStep.ERROR);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    step,
    fieldError,
    loginType,
    userIdentifier,
    nav?.options?.post_login_redirect,
    state.config?.postLoginUrl,
    user.data,
    app.config?.default_user_id_format,
    app.id,
    requiresAdditionalFields,
    addlFieldValues,
    getFingerprint,
    getChallengeIfPresent,
    api,
    config?.appKey,
    dispatch,
    clearFingerprint,
  ]);

  const launchRowndWebsite = () => {
    Linking.openURL('https://rownd.io');
  };

  const handleAddlFieldChange = (evt: Event) => {
    const target = evt.target as HTMLInputElement;
    const { value, name } = target;

    addlFieldDispatch({
      type: 'default',
      payload: {
        [name]: value,
      },
    });
  };

  const handleClose = useCallback(() => {
    setTimeout(() => {
      navTo({ hide: true });
    }, 150);
  }, [navTo]);

  const snapPoints = useMemo(() => ['25%', '70%'], []);

  const renderBackdrop = useCallback(
    (cbProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...cbProps} pressBehavior="close" />
    ),
    []
  );

  let extraBottomSheetProps: any = {};
  if (bottomSheetMeta.version.startsWith('4')) {
    extraBottomSheetProps.keyboardBehavior = 'fillParent';
    extraBottomSheetProps.android_keyboardInputMode = 'adjustResize';
    extraBottomSheetProps.enablePanDownToClose =
      state?.nav?.options?.type === 'error';
  }

  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      index={1}
      backdropComponent={renderBackdrop}
      onDismiss={handleClose}
      style={styles.bottomSheet}
      ref={bottomSheetModalRef}
      {...extraBottomSheetProps}
    >
      <View style={styles.innerContainer}>
        {step === LoginStep.INIT && (
          <>
            {app?.config?.hub?.auth?.show_app_icon &&
              app?.icon &&
              (app.icon_content_type === 'image/svg+xml' ? (
                <SvgCssUri uri={app.icon} style={styles.appLogo} />
              ) : (
                <Image style={styles.appLogo} source={{ uri: app.icon }} />
              ))}
            <Text style={styles.dialogHeading}>Sign in or sign up</Text>
            <Text style={styles.inputLabel}>Email or phone number</Text>
            <BottomSheetTextInput
              style={styles.identifierInput}
              placeholder="Enter here"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyLabel="Sign in"
              returnKeyType="go"
              enablesReturnKeyAutomatically={true}
              autoCapitalize="none"
              onChangeText={(text: string) => setUserIdentifier(text.trim())}
              onBlur={validateInput}
              value={userIdentifier}
              onSubmitEditing={initSignIn}
            />
            {requiresAdditionalFields &&
              app?.config?.hub?.auth?.additional_fields.map((field) => {
                return renderField({
                  ...field,
                  value: addlFieldValues[field.name] || '',
                  [['input', 'text', 'tel', 'email'].includes(field.type)
                    ? 'onInput'
                    : 'onChange']: handleAddlFieldChange,
                });
              })}
            <TouchableOpacity
              disabled={!isValidUserIdentifier || isSubmitting}
              onPress={initSignIn}
            >
              <View
                style={{
                  ...styles.button,
                  ...(!isValidUserIdentifier && styles.buttonDisabled),
                  ...(isSubmitting && styles.buttonSubmitting),
                }}
              >
                <View style={styles.buttonText}>
                  <Text
                    style={
                      isValidUserIdentifier
                        ? styles.buttonContent
                        : {
                            ...styles.buttonContent,
                            ...styles.buttonDisabledText,
                          }
                    }
                  >
                    {isSubmitting && (
                      <ActivityIndicator
                        size="small"
                        color="#efefef"
                        style={styles.loadingIndicator}
                      />
                    )}
                    {isSubmitting ? 'Just a sec...' : 'Continue'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.signInNoticeText}>
              By continuing, you're agreeing to the terms of service that govern
              this app and to receive email or text messages for verification
              purposes.
            </Text>
          </>
        )}

        {step === LoginStep.WAITING && (
          <>
            <Text style={styles.dialogHeading}>
              Thanks! Verify your{' '}
              {loginType === 'phone' ? 'phone number' : 'email'} to finish
            </Text>
            <Text style={tw.style('py-6')}>
              Click the link in the message we just sent to{' '}
              <Text style={tw.style('italic')}>{userIdentifier}</Text> to verify
              and finish.
              <Text
                style={[styles.link]}
                onPress={() => setStep(LoginStep.INIT)}
              >
                &nbsp;Re-send message
              </Text>
            </Text>

            <View style={styles.signInVerificationImage}>
              {loginType === 'phone' ? (
                <ImagePhoneVerifyWaiting />
              ) : (
                <ImageEmailVerifyWaiting />
              )}
            </View>

            <TouchableOpacity
              style={[styles.button]}
              onPress={() => setStep(LoginStep.INIT)}
            >
              <Text style={styles.buttonContent}>
                Try a different{' '}
                {loginType === 'phone' ? 'phone number' : 'email'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === LoginStep.SUCCESS && (
          <>
            <View style={styles.signInVerificationImage}>
              <ImageCheckmarkFilled />
            </View>
          </>
        )}

        {step === LoginStep.FAILURE && (
          <>
            <Text style={tw.style('text-base')}>Whoops, that didn't work!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(LoginStep.INIT)}
            >
              <Text style={styles.buttonContent}>Try again</Text>
            </TouchableOpacity>
          </>
        )}

        {step === LoginStep.ERROR && (
          <>
            <Text style={tw.style('text-base')}>
              An error occurred while signing you in.
            </Text>
            {!!error && <Text style={tw.style('text-rose-800')}>{error}</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(LoginStep.INIT)}
            >
              <Text style={styles.buttonContent}>Try again</Text>
            </TouchableOpacity>
          </>
        )}
        <Text>
          Powered by{' '}
          <Text style={styles.link} onPress={launchRowndWebsite}>
            Rownd
          </Text>
        </Text>
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
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  appLogo: {
    padding: 50,
    width: 75,
    height: 75,
    resizeMode: 'center',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
  },
  dialogHeading: {
    fontSize: 24,
  },
  inputLabel: {
    marginTop: 20,
    marginBottom: 5,
  },
  identifierInput: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    marginBottom: 30,
    elevation: 0,
    backgroundColor: '#5b0ae0',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // height: 45,
  },
  buttonDisabled: {
    backgroundColor: '#eee',
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonContent: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
  },
  buttonText: {
    // marginHorizontal: 10,
    // paddingHorizontal: 10,
    // fontSize: 18,
    // color: '#fff',
  },
  buttonTextInner: {
    fontSize: 18,
  },
  buttonDisabledText: {
    color: '#8e8e8e',
  },
  buttonSubmitting: {
    backgroundColor: '#2f0492',
    color: '#c7c7c7',
  },
  loadingIndicator: {
    marginRight: 10,
  },
  signInNoticeText: {
    fontSize: 12,
    marginBottom: 20,
  },
  signInVerificationImage: {
    alignItems: 'center',
  },
  link: {
    color: '#6114e1',
  },
});
