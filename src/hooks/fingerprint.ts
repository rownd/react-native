import DeviceInfo from 'react-native-device-info';
import { useEffect, useCallback } from 'react';
import useApi from './api';
import { useGlobalContext } from '../components/GlobalContext';
import storage from '../utils/storage';
import { sha256 } from 'react-native-sha256';

interface IFingerprint {
  message: string;
  hash: string;
  challenge: string;
}

interface IChallenge {
  key: string;
  value: string;
}

let isFingerprintingInProgress = false;

export default function () {
  const { state } = useGlobalContext();
  const { client: api } = useApi();

  /**
   * Computes hashes for all possible lookup fields values coupled with the app ID
   * @param appId
   * @param rawLookupValues
   * @returns array of challenge hashes
   */
  async function computePossibleChallengeLookupValues(
    appId: string,
    rawLookupValues: string[]
  ): Promise<string[]> {
    const lookupHashes = [];
    for (const value of rawLookupValues) {
      lookupHashes.push(await sha256(`${appId}:${value}`));
    }
    return lookupHashes;
  }

  /**
   * Looks for a challenge in storage based on presented lookup values
   */
  const getChallengeIfPresent = useCallback(
    async (
      appId: string | undefined,
      challengeLookupValues: string[]
    ): Promise<IChallenge | null> => {
      if (!appId) {
        return null;
      }

      const challenges: Record<string, string[]> = JSON.parse(
        storage.getString('challenges') || '{}'
      );

      if (!Object.keys(challenges).length) {
        return null;
      }

      let challengeKey = '';
      let challengeValue = '';
      for (const value of challengeLookupValues) {
        const hash = await sha256(`${appId}:${value}`);
        const challenge = Object.entries(challenges).find(([, hashes]) =>
          hashes.includes(hash)
        );

        if (challenge) {
          challengeKey = hash;
          challengeValue = challenge[0];
          break;
        }
      }

      if (!challengeKey || !challengeValue) {
        return null;
      }

      return {
        key: challengeKey,
        value: challengeValue,
      };
    },
    []
  );

  const getFingerprint = useCallback(async () => {
    const visitorId = DeviceInfo.getDeviceId();

    return {
      visitorId,
    };
  }, []);

  const registerFingerprint = useCallback(async () => {
    if (
      !state.auth.access_token ||
      !state.auth.is_verified_user ||
      !state.app.id ||
      isFingerprintingInProgress
    ) {
      return;
    }

    isFingerprintingInProgress = true;

    try {
      // Check for existing challenge
      const challengeEntry = await getChallengeIfPresent(
        state.app.id,
        [state.user?.data?.email, state.user?.data?.phone_number].filter(
          Boolean
        )
      );

      const fingerprint = await getFingerprint();
      const payload: IFingerprint = await api
        .post('hub/auth/fingerprints', {
          headers: {
            Authorization: `Bearer ${state.auth.access_token}`,
          },
          json: {
            hash: fingerprint.visitorId,
            challenge: challengeEntry?.value || null, // Might exist from a previous run, in which case this request will be a no-op
          },
        })
        .json();

      if (payload.challenge === challengeEntry?.key) {
        // This is a no-op
        console.debug('Fingerprint already registered');
        return;
      }

      // Save the challenge for future sign-ins if we don't have one already or we got a new one from the server
      const challengeLookupHashes = await computePossibleChallengeLookupValues(
        state.app.id,
        [state.user?.data?.email, state.user?.data?.phone_number].filter(
          Boolean
        )
      );
      if (payload.challenge && challengeLookupHashes.length > 0) {
        const challenges = JSON.parse(storage.getString('challenges') || '{}');
        storage.set(
          'challenges',
          JSON.stringify({
            ...challenges,
            [payload.challenge]: challengeLookupHashes,
          })
        );
      }
    } catch (err) {
      console.warn('Failed to register fingerprint', err);
    } finally {
      isFingerprintingInProgress = false;
    }
  }, [
    api,
    state.app.id,
    state.auth.access_token,
    state.auth.is_verified_user,
    state.user?.data?.email,
    state.user?.data?.phone_number,
    getChallengeIfPresent,
    getFingerprint,
  ]);

  const clearFingerprint = useCallback((challenge: string) => {
    const challenges: Record<string, string[]> = JSON.parse(
      storage.getString('challenges') || '{}'
    );
    delete challenges[challenge];
    storage.set('challenges', JSON.stringify(challenges));
  }, []);

  useEffect(() => {
    if (!state.auth.access_token) {
      return;
    }

    (async () => {
      // If already fingerprinted, don't try again
      const existingChallenge = await getChallengeIfPresent(
        state.app.id,
        [state.user?.data?.email, state.user?.data?.phone_number].filter(
          Boolean
        )
      );

      // Don't need to re-register a fingerprint if we already have one registered
      if (existingChallenge) {
        console.debug(
          'Found existing challenge, so not requesting fingerprint registration.'
        );
        return;
      }

      // We have an access token, so we can use it to get the fingerprint
      registerFingerprint();
    })();
  }, [
    getChallengeIfPresent,
    registerFingerprint,
    state.app.id,
    state.auth.access_token,
    state.user?.data?.email,
    state.user?.data?.phone_number,
  ]);

  return {
    getFingerprint,
    getChallengeIfPresent,
    clearFingerprint,
  };
}
