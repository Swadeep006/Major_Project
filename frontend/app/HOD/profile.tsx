import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@startlinks/react-native-toast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { auth } from '@/firebaseConfig';
import { api } from '@/lib/api';

export default function HODProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Profile Data
    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                router.replace('/login');
                return;
            }
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setPhone(parsedUser.phone || '');
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!user) return;
        setUpdating(true);

        try {
            // 1. Update Password (if provided)
            if (newPassword) {
                if (!currentPassword) {
                    toast.error('Current password is required to set new password');
                    setUpdating(false);
                    return;
                }

                const currentUser = auth.currentUser;
                if (!currentUser) {
                    toast.error('Session expired. Please login again.');
                    router.replace('/login');
                    return;
                }

                const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
                await updatePassword(currentUser, newPassword);
                toast.success('Password updated');
            }

            const updatedUser = { ...user, phone };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            if (!newPassword) toast.success('Profile updated (Local)');

            setCurrentPassword('');
            setNewPassword('');

        } catch (error: any) {
            console.error(error);
            toast.error('Update failed: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            await AsyncStorage.removeItem('user');
            router.replace('/login');
        } catch (error) {
            console.error(error);
            toast.error('Sign out failed');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-white" onPress={() => router.push('/HOD')}>UniACE</Text>
                <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                    <Text className="text-xs font-bold ">{user?.name?.charAt(0)}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <Text className="text-2xl font-bold text-red-500 mb-4 px-2">PROFILE</Text>

                    <View className="w-24 h-24 rounded-full bg-yellow-200 mb-4 items-center justify-center border-2 border-yellow-400">
                        <Text className="text-4xl font-bold text-yellow-600">{user?.name?.charAt(0)}</Text>
                    </View>

                    <Text className="text-2xl font-bold text-center">{user?.name}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">Emp Id : {user?.employeeId || 'N/A'}</Text>
                    <Text className="text-sm text-muted-foreground">{user?.department || 'N/A'}</Text>
                </View>

                <Card className="mb-8 border-0 shadow-none">
                    <CardContent className="gap-6">
                        <View className="flex-row items-center">
                            <Text className="w-24 font-bold text-base">Ph.No :</Text>
                            <Input
                                className="flex-1 border-b border-border bg-transparent  text-muted-foreground px-0 h-10"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="Enter Phone Number"

                            />
                        </View>

                        <View className="flex-row items-center">
                            <Text className="w-24 font-bold text-base">Email Id :</Text>
                            <Text className="flex-1 text-base text-muted-foreground py-2 border-b border-border/50">{user?.email}</Text>
                        </View>

                        <View className="gap-2 mt-2">
                            <Text className="font-bold text-base mb-2">Change Password :</Text>
                            <Input
                                placeholder="Current Password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                className="mb-2"
                            />
                            <Input
                                placeholder="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <Button className="mt-6 bg-blue-400 w-full rounded-xl" onPress={handleUpdate} disabled={updating}>
                            <Text className="text-white font-bold">{updating ? 'UPDATING...' : 'UPDATE'}</Text>
                        </Button>

                        <Button variant="outline" className="mt-4 border-red-200" onPress={handleSignOut}>
                            <Text className="text-red-500">Log Out</Text>
                        </Button>
                    </CardContent>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
