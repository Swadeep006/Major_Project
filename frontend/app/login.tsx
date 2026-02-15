import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@startlinks/react-native-toast';

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

      toast.success(`Welcome ${profile.name}!`);

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
        toast.error('Login Error: Unknown role assigned to user.');
      }

    } catch (error: any) {
      console.error('Login Error:', error);
      // Clean up if profile fetch failed but auth succeeded
      if (auth.currentUser) {
        await auth.signOut();
      }
      toast.error('Login Failed: ' + ((error as any).code || error.message));
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
