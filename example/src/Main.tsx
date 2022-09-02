import { useRownd } from '@rownd/react-native';
import React from 'react';
import { View, Button, Text } from 'react-native';

export default function Main() {
  const { requestSignIn, signOut, user } = useRownd();

  return (
    <View>
      {user.data?.email && <Text>Email: {user.data?.email}</Text>}
      <Button title="Sign In" onPress={() => requestSignIn()} />
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}
