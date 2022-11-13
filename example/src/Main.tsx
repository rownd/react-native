import { useRownd } from '../../src/index';
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';

export default function Main() {
  const { requestSignIn, signOut, user, manageAccount, is_authenticated, getAccessToken } =
    useRownd();
  const [accessToken, setAccessToken] = useState<string | null>(null);

    const loadAccessToken = () => {
      getAccessToken().then((data) => {
        console.log("SET ACCESS TOKEN: ",data)
        setAccessToken(data)
      }).catch((error) => {
        setAccessToken(null);
        console.log({error})
      })
    }

  return (
    <View>
      {user.data?.email && <Text>Email: {user.data?.email}</Text>}
      {user.data?.first_name && (
        <Text>First Name: {user.data?.first_name}</Text>
      )}
      {user.data?.birth_day && <Text>Birth Day: {user.data?.birth_day}</Text>}
      {accessToken && <Text>Access Token: {accessToken}</Text>}
      {is_authenticated ? (
        <Button title="Sign Out" onPress={() => {
          setAccessToken(null);
          signOut();
        }} />
      ) : (
        <>
          <Button
            title="Sign In"
            onPress={() =>
              requestSignIn({
                method: 'default',
                postSignInRedirect: 'https://www.espn.com/',
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
      <Button title='Get Access Token' onPress={() => loadAccessToken()}/>
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
            birth_day: 43,
            user_id: '82f05836-5cfb-4cdd-85ad-4e2823550cfb',
            first_name: 'Richard',
          })
        }
      />
    </View>
  );
}
