import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { RowndProvider, useRownd } from '@rownd/react-native';

const loadingAnimation = require('./assets/loading.json');

const SignIn = () => {
  const { requestSignIn } = useRownd();
  return <Button title="Sign in" onPress={() => requestSignIn()} />;
};

const SignOut = () => {
  const { signOut } = useRownd();
  return <Button title="Sign out" onPress={() => signOut()} />;
};

const MainView = () => {
  const { user, access_token, is_authenticated } = useRownd();
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      {is_authenticated && <Text>User: {user.data?.email}</Text>}
      {is_authenticated && <Text>Access Token: {access_token}</Text>}
      {!is_authenticated && <SignIn />}
      {is_authenticated && <SignOut />}
    </View>
  );
};

export default function App() {
  return (
    <RowndProvider
      config={{ appKey: 'YOUR_APP_KEY' }}
      customizations={{
        sheetBackgroundHexColor: '#ffedbd',
        sheetCornerBorderRadius: '20',
        loadingAnimation: JSON.stringify(loadingAnimation),
      }}
    >
      <MainView />
    </RowndProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
