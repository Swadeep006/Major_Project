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
import { Header } from '@/components/common/Header';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestCard } from '@/components/common/RequestCard';

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
        return <LoadingScreen message="Loading history..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Header
                title="History"
                showBackButton
                onBackPress={() => router.back()}
                onProfilePress={() => router.push('/security/profile')}
                userName={user?.name}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                {history.map((req) => (
                    <RequestCard
                        key={req.id}
                        request={req}
                        status="Completed" // In history it's always completed/exited
                        renderExtraDetails={() => (
                            <View className="mt-2 pt-2 border-t border-border/50 items-center">
                                <View className="border border-border rounded-lg p-2 mt-2 mb-2 bg-muted/10 w-full">
                                    <Text className="text-xs font-medium italic text-center">"{req.remarks || 'No remarks'}"</Text>
                                </View>
                                <Text className="text-lg font-bold text-primary tracking-widest">
                                    Time Of Exit : {formatTime(req.exitTime)}
                                </Text>
                            </View>
                        )}
                    />
                ))}

                {history.length === 0 && (
                    <EmptyState title="No History Found" message="No exits have been logged yet." />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
