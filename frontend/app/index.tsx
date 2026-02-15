import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Import your Firebase Auth instance
import { auth } from '../firebaseConfig';
import { api } from '@/lib/api';

// 2. Import the Reusable component
import { SignInForm } from '@/components/ui/sign-in-form';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      // 1. Firebase Authentication Logic
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      // 2. Fetch User Profile to get Role
      const profile = await api.getUserProfile(uid);

      // 3. Store User Session (Basic)
      await AsyncStorage.setItem('user', JSON.stringify({ uid, ...profile }));

      Alert.alert('Success', `Welcome ${profile.name}!`);

      // 4. Navigate based on Role
      if (profile.role === 'student') {
        router.replace('/student');
      } else if (profile.role === 'incharge') {
        router.replace('/incharge');
      } else if (profile.role === 'hod') {
        router.replace('/HOD');
      } else if (profile.role === 'security') {
        router.replace('/security');
      } else {
        Alert.alert('Error', 'Unknown role');
      }

    } catch (error: any) {
      Alert.alert('Login Error', (error as any).code || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-background p-6">
      <SignInForm onSubmit={handleLogin} isLoading={loading} />
    </View>
  );
}
