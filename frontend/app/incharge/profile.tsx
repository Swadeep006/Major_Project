import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@startlinks/react-native-toast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ArrowLeft, User, Phone, Mail, Lock, LogOut, Save } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { auth } from '@/firebaseConfig';
import { Header } from '@/components/common/Header';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export default function InchargeProfile() {
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
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Session expired. Please login again.');
            }

            // 1. Update Password (if provided)
            if (newPassword) {
                if (!currentPassword) {
                    toast.error('Current password is required to set new password');
                    setUpdating(false);
                    return;
                }

                const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
                await updatePassword(currentUser, newPassword);
                toast.success('Password updated successfully');
            }

            // 2. Update Phone (local only for now as per previous logic)
            const updatedUser = { ...user, phone };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            if (!newPassword) toast.success('Profile updated');

            setCurrentPassword('');
            setNewPassword('');

        } catch (error: any) {
            console.error(error);
            toast.error('Update failed: ' + error.message);
            if (error.message.includes('Session expired')) {
                router.replace('/login');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            await AsyncStorage.clear();
                            router.replace('/login');
                        } catch (error) {
                            console.error(error);
                            toast.error('Sign out failed');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <LoadingScreen message="Loading profile..." />;
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Header
                title="Profile"
                showBackButton
                onBackPress={() => router.back()}
                onProfilePress={() => { }}
                userName={user?.name}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {/* Profile Header */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center border-4 border-white shadow-sm mb-4">
                        <Text className="text-4xl font-bold text-primary">{user?.name?.charAt(0)}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
                    <View className="flex-row items-center mt-1 bg-muted/40 px-3 py-1 rounded-full">
                        <Text className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{user?.role || 'Incharge'} • {user?.department || 'General'}</Text>
                    </View>
                </View>

                {/* Info Card */}
                <Card className="mb-6 border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <View>
                            <View className="flex-row items-center gap-2 mb-1">
                                <Icon as={Mail} size={16} className="text-muted-foreground" />
                                <Text className="text-sm font-medium text-muted-foreground">Email</Text>
                            </View>
                            <Text className="text-base text-foreground pl-6">{user?.email}</Text>
                        </View>

                        <View>
                            <View className="flex-row items-center gap-2 mb-1">
                                <Icon as={Phone} size={16} className="text-muted-foreground" />
                                <Text className="text-sm font-medium text-muted-foreground">Phone Number</Text>
                            </View>
                            <TextInput
                                className="flex-1 border border-border rounded-lg px-3 py-2 text-base text-foreground bg-background ml-6 focus:border-primary"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="Enter Phone Number"
                            />
                        </View>
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card className="mb-8 border border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <View>
                            <View className="flex-row items-center gap-2 mb-2">
                                <Icon as={Lock} size={16} className="text-muted-foreground" />
                                <Text className="text-sm font-medium text-muted-foreground">Change Password</Text>
                            </View>
                            <View className="ml-6 space-y-3">
                                <TextInput
                                    className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-background"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry
                                />
                                <TextInput
                                    className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-background"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>
                    </CardContent>
                </Card>

                <Button
                    className="w-full bg-primary mb-4 h-12 rounded-xl flex-row items-center justify-center gap-2"
                    onPress={handleUpdate}
                    disabled={updating}
                >
                    {updating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Icon as={Save} size={20} className="text-white" />
                            <Text className="text-black font-bold text-base">Save Changes</Text>
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    className="w-full border-border h-12 rounded-xl flex-row items-center justify-center gap-2 bg-background"
                    onPress={handleSignOut}
                >
                    <Icon as={LogOut} size={20} className="text-foreground" />
                    <Text className="text-foreground font-bold text-base" onPress={()=>router.push('/login')}>Log Out</Text>
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
}
