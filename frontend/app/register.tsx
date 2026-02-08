import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// 1. Import your Firebase Auth instance
import { auth } from '../firebaseConfig';

// 2. Import the Reusable component
import { SignUpForm } from '@/components/ui/sign-up-form'
export default function RegisterScreen() {
  return <>
  <SignUpForm/>
  </>;
}
