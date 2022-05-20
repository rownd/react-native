// import * as SecureStore from 'expo-secure-store';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export async function getItem(key: string) {
//     let value = await AsyncStorage.getItem(key);
//     console.log('got storage:', value);
//     return value;
// }

// export async function setItem(key: string, value: any) {
//     return AsyncStorage.setItem(key, value);
// }

// export async function removeItem(key: string) {
//     return AsyncStorage.removeItem(key);
// }

import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
    id: 'rownd-storage'
});

export default storage;