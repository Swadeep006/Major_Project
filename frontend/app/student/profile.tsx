import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { ArrowLeft } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function StudentProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Refresh from API if possible
                try {
                    const freshData = await api.getUserProfile(parsedUser.uid);
                    setUser({ ...parsedUser, ...freshData });
                    await AsyncStorage.setItem('user', JSON.stringify({ ...parsedUser, ...freshData }));
                } catch (e) {
                    // Ignore API error, use stored data
                }
            } else {
                router.replace('/login');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Validation', 'Please fill all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Validation', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters');
            return;
        }

        setUpdating(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'User session expired. Please login again.');
                await handleSignOut();
                return;
            }

            const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);

            Alert.alert('Success', 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password Update Error:', error);
            if (error.code === 'auth/wrong-password') {
                Alert.alert('Error', 'Incorrect current password');
            } else {
                Alert.alert('Error', error.message || 'Failed to update password');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.removeItem('user');
            router.replace('/login');
        } catch (error) {
            console.error('Sign Out Error:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-4 py-3 flex-row items-center border-b border-border/50">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <ArrowLeft size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Label>Name</Label>
                            <Input value={user.name} editable={false} className="bg-muted text-muted-foreground" />
                        </View>
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Label>Roll Number</Label>
                                <Input value={user.rollNumber} editable={false} className="bg-muted text-muted-foreground" />
                            </View>
                            <View className="flex-1">
                                <Label>Department</Label>
                                <Input value={user.department} editable={false} className="bg-muted text-muted-foreground" />
                            </View>
                        </View>
                        <View>
                            <Label>Year & Section</Label>
                            <Input value={user.yearSection} editable={false} className="bg-muted text-muted-foreground" />
                        </View>
                        <View>
                            <Label>Email</Label>
                            <Input value={user.email} editable={false} className="bg-muted text-muted-foreground" />
                        </View>
                        <View>
                            <Label>Phone</Label>
                            <Input value={user.studentPhone} editable={false} className="bg-muted text-muted-foreground" />
                        </View>
                        <View>
                            <Label>Parent Phone</Label>
                            <Input value={user.parentPhone} editable={false} className="bg-muted text-muted-foreground" />
                        </View>
                    </CardContent>
                </Card>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Label>Current Password</Label>
                            <Input
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                placeholder="Required to set new password"
                            />
                        </View>
                        <View>
                            <Label>New Password</Label>
                            <Input
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="Minimum 6 characters"
                            />
                        </View>
                        <View>
                            <Label>Confirm New Password</Label>
                            <Input
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholder="Re-enter new password"
                            />
                        </View>
                        <Button onPress={handleUpdatePassword} disabled={updating}>
                            <Text>{updating ? 'Updating...' : 'Update Password'}</Text>
                        </Button>
                    </CardContent>
                </Card>

                <Button variant="destructive" onPress={handleSignOut} className="mb-8">
                    <Text>Log Out</Text>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
