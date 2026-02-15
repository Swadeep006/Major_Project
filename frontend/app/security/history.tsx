import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { toast } from '@startlinks/react-native-toast';
import { format } from 'date-fns';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function SecurityHistory() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                router.replace('/login');
                return;
            }
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            if (parsedUser.role !== 'security') {
                router.replace('/');
                return;
            }

            await fetchHistory(parsedUser.uid);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (employeeId: string) => {
        try {
            // role="security"
            const data = await api.getEmployeeRequests(employeeId, 'security');
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch history');
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        let date;
        if (typeof timestamp === 'string') date = new Date(timestamp);
        else if (timestamp._seconds) date = new Date(timestamp._seconds * 1000);
        else date = new Date(timestamp);
        return format(date, 'M/d/yy, h:mm a');
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        let date;
        if (typeof timestamp === 'string') date = new Date(timestamp);
        else if (timestamp._seconds) date = new Date(timestamp._seconds * 1000);
        else date = new Date(timestamp);
        return format(date, 'h:mm a');
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-primary" onPress={() => router.push('/security')}>UniACE</Text>
                <TouchableOpacity onPress={() => router.push('/security/profile')}>
                    <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                        <Text className="text-xs font-bold">{user?.name?.charAt(0)}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
                <Text className="text-2xl font-bold tracking-widest text-primary/80">HISTORY</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {history.map((req) => (
                    <Card key={req.id} className="mb-4 border border-border shadow-sm">
                        <CardContent className="p-4">
                            <View className="flex-row justify-between">
                                {/* Left Column */}
                                <View className="flex-1 space-y-1">
                                    <Text className="text-xs font-bold">Request Id : {(req.id || '').substring(0, 4)}</Text>
                                    <Text className="text-xs text-muted-foreground">Applied On : {formatDate(req.createdAt)}</Text>
                                    <Text className="text-xs font-medium">Reason : {req.reason}</Text>
                                    <Text className="text-xs text-muted-foreground">Destination : {req.destination}</Text>




                                </View>

                                {/* Right Column */}
                                <View className="flex-1 items-end space-y-1">
                                    <Text className="text-xs font-bold">Student Name: {req.name}</Text>
                                    <Text className="text-xs text-muted-foreground">Roll No : {req.rollNo}</Text>
                                    <Text className="text-xs text-muted-foreground">Year&Section : {req.yearSection}</Text>
                                    <Text className="text-xs text-muted-foreground">Department : {req.department}</Text>
                                </View>
                            </View>

                            <View className="mt-4 pt-2 border-t border-border/50 items-center">
                                <View className="border border-border rounded-lg p-2 mt-2 mb-2 bg-muted/10">
                                    <Text className="text-xs font-medium italic">"{req.remarks || 'No remarks'}"</Text>
                                </View>
                                <Text className="text-lg font-bold text-primary tracking-widest">
                                    Time Of Exit : {formatTime(req.exitTime)}
                                </Text>
                            </View>

                        </CardContent>
                    </Card>
                ))}

                {history.length === 0 && (
                    <View className="mt-10 items-center">
                        <Text className="text-muted-foreground">No history found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
