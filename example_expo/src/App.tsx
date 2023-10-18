import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import {
  RowndProvider,
  useRownd,
  SignedIn,
  SignedOut,
  RequireSignIn,
} from '@rownd/react-native';

const AuthenticatedScreen = () => {
  const { signOut, user, is_initializing, manageAccount, requestSignIn } = useRownd();

  if (is_initializing) {
    return <Text>Initializing...</Text>;
  }

  return (
    <View>
      <SignedIn>
        <Text>Hello: {user.data.email || user.data.user_id}</Text>
        <Button title="Sign out" onPress={() => signOut()} />
        <Button title="Profile" onPress={() => manageAccount()} />
        <Button title='Set value' onPress={() => user.setValue('last_name','random')} />
      </SignedIn>
      <SignedOut>
        <Button title='Sign in' onPress={() => requestSignIn()} />
        <RequireSignIn />
      </SignedOut>
    </View>
  );
};

export default function App() {
  return (
    <RowndProvider config={{ appKey: 'ROWND_APP_KEY' }}>
      <View style={styles.container}>
        <Text>React Native App</Text>
        <AuthenticatedScreen />
      </View>
    </RowndProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
