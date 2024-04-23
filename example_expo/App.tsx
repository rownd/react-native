import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { RowndProvider, useRownd } from '@rownd/react-native';

const SignIn = () => {
  const { requestSignIn } = useRownd();
  return <Button title='Sign in' onPress={() => requestSignIn()} />
}

export default function App() {
  return (
    <RowndProvider config={{ appKey: 'key_bec29kgy4l1zu14vwy63rq62' }}>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <SignIn />
      </View>
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
