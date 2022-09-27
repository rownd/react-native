# @rownd/react-native

Rownd bindings for React Native

## Prerequisites
You must be using React Native v0.61 or higher.

## Installation

First, install the Rownd SDK for React Native.

```sh
npm install @rownd/react-native
```

### Android

```sh
cd android
```
```sh
./gradlew build
```

### iOS

Add the code below to ios/Podfile. Place inside target
```
dynamic_frameworks = ['Sodium']
  pre_install do |installer|
    installer.pod_targets.each do |pod|
      if dynamic_frameworks.include?(pod.name)
        puts "Overriding the dynamic_framework? method for #{pod.name}"
        def pod.dynamic_framework?;
          true
        end
        def pod.build_type;
          Pod::BuildType.dynamic_framework
        end
      end
    end
  end
```
On command line run:

```sh
cd ios
```
```sh
pod install
```

## Setup

### Enable deep linking
Rownd supports automatically signing-in users when they initially install your
app or when they click a sign-in link when the app is already installed. 


## Usage
The Rownd SDK includes a context provider that will enable any component of your app to access authentication state and user data.

Before you can use the SDK, you'll need to obtain an App Key from the [Rownd Dashboard](https://app.rownd.io).

```tsx
import { RowndProvider } from "@rownd/react-native";

// ...

export default function Root() {
  return (
      <RowndProvider config={{appKey:"<your app key>"}}>
        <App />
      </RowndProvider>
  );
}
```

Later on within your app's components, you can use the Rownd hook to access the Rownd browser API:

```tsx
import { View, Text } from 'react-native';
import { useRownd } from '@rownd/react-native';

export default function MyProtectedComponent(props) {
  const { is_authenticated, user, requestSignIn, getAccessToken } = useRownd();

  // You can also request a sign in without a user pressing a button
  // by calling requestSignIn() from a useEffect callback.
  // useEffect(() => {
  //   if (!is_authenticated) {
  //     requestSignIn();
  //   }
  // }, [is_authenticated]);

  return (
    <View>
      {is_authenticated ? (
        <>
          <h1>Welcome {user.data.first_name}</h1>
          <button onClick={() => getAccessToken()}>Get access token</button>
        </>
      ) : (
        <>
          <Text>Please sign in to continue</Text>
          <Pressable onPress={() => requestSignIn()}>
            <Text>Sign in</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
```

## API reference

Most API methods are made available via the Rownd Provider and its associated `useRownd` React hook. Unless otherwise noted, we're assuming that you're using hooks.

#### requestSignIn()

Trigger the Rownd sign in dialog

```javascript
const { requestSignIn } = useRownd();

requestSignIn();
```

#### signOut()

Sign out the user and clear their profile, returning them to a completely unauthenticated state.

```javascript
const { signOut } = useRownd();
signOut();
```

#### **getAccessToken()**

Retrieves the active, valid access token for the current user.&#x20;

```javascript
const { getAccessToken } = useRownd();

let accessToken = await getAccessToken({
    waitForToken: false
});
```

* `waitForToken: boolean` - when `true`, if no access token is present or if it's expired, the promise will not resolve until a valid token is available. While unlikely, this could result in waiting forever.

#### is\_authenticated

Indicates whether the current user is signed in or not.

```javascript
const { is_authenticated } = useRownd();

return (
  <>
    {is_authenticated && <ProtectedRoute />}
    {!is_authenticated && <PublicRoute />}
  </>
);
```

#### access\_token

Represents the current access token for the user.

```javascript
const { access_token } = useRownd();

useEffect(() => {
    axios({
        method: 'post',
        url: '/api/sessions'
        headers: {
            authorization: `Bearer ${access_token}`
        }
    }).then(console.log);
}, [access_token]);
```

#### user

Represents information about the current user, specifically their profile information. In the example below, we use the existing data to display the current value of `first_name` in a form field, update a local copy of that data as the user changes it, and then save the changes to Rownd once the user submits the form.

```javascript
const { user } = useRownd();

return (
    <form onSubmit={() => user.set(profile)}>
        <Text>First name</Text>
            <TextInput
                value={user?.data?.first_name}
                onChangeText={}
            />
        <Pressable onPress={}>Save</button>
    </form>
);
```

**Merge data into the user profile**

```javascript
const { user } = useRownd();
user.set({
    first_name: 'Alice',
    last_name: 'Ranier'
});
```

Set a specific field in the user profile

```javascript
const { user } = useRownd();
user.setValue('first_name', 'Alice');
```

## License

Apache 2.0
