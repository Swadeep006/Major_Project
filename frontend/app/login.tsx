import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';

// 1. Import your Firebase Auth instance
import { auth } from '../firebaseConfig';

// 2. Import the Reusable component
import { SignInForm } from '@/components/ui/sign-in-form';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: any) => {
    setLoading(true);
    try {
      // Firebase Authentication Logic
      await signInWithEmailAndPassword(auth, data.email, data.password);
      Alert.alert('Success', 'Logged in successfully!');
      router.replace('./index'); 
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
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
