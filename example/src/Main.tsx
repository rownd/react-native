import { useRownd } from '../../src/index';
import React from 'react';
import { View, Button, Text } from 'react-native';

export default function Main() {
  const { requestSignIn, signOut, user, manageAccount } = useRownd();

  console.log({ user });

  return (
    <View>
      {user.data?.email && <Text>Email: {user.data?.email}</Text>}
      {user.data?.first_name && (
        <Text>First Name: {user.data?.first_name}</Text>
      )}
      {user.data?.birth_day && <Text>Birth Day: {user.data?.birth_day}</Text>}
      <Button title="Sign In" onPress={() => requestSignIn()} />
      <Button title="Sign Out" onPress={() => signOut()} />
      <Button title="Manage User" onPress={() => manageAccount()} />
      <Button
        title="Set First Name"
        onPress={() => user.setValue('first_name', 'Michael')}
      />
      <Button
        title="Set different First Name"
        onPress={() => user.setValue('first_name', 'Steve')}
      />
      <Button
        title="Set Birth Day"
        onPress={() => user.setValue('birth_day', 40)}
      />
      <Button
        title="Set different Birth Day"
        onPress={() => user.setValue('birth_day', 50)}
      />
      <Button
        title="Update user data"
        onPress={() =>
          user.set({
            email: 'michael@rownd.io',
            birth_day: 43,
            user_id: '82f05836-5cfb-4cdd-85ad-4e2823550cfb',
            first_name: 'Richard',
          })
        }
      />
    </View>
  );
}
