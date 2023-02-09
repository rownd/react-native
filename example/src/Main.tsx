import { useRownd } from '../../src/index';
import React from 'react';
import { View, Button, Text } from 'react-native';

export default function Main() {
  const {
    requestSignIn,
    signOut,
    user,
    manageAccount,
    is_authenticated,
    access_token,
  } = useRownd();

  return (
    <View>
      {user.data?.email && <Text>Email: {user.data?.email}</Text>}
      {access_token && <Text>Access Token: {access_token}</Text>}
      {is_authenticated ? (
        <Button
          title="Sign Out"
          onPress={() => {
            signOut();
          }}
        />
      ) : (
        <>
          <Button
            title="Sign In"
            onPress={() =>
              requestSignIn({
                postSignInRedirect: 'NATIVE_APP',
              })
            }
          />
          <Button
            title="Sign In (Apple)"
            onPress={() => requestSignIn({ method: 'apple' })}
          />
          <Button
            title="Sign In (Google)"
            onPress={() => requestSignIn({ method: 'google' })}
          />
        </>
      )}

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
        title="Update user data"
        onPress={() =>
          user.set({
            birth_day: 25,
            user_id: '7ef4fbbf-b41c-4bb1-afc7-2de9211b6eae',
            first_name: 'Randy',
            email: 'mfmurray@umich.edu',
          })
        }
      />
    </View>
  );
}
