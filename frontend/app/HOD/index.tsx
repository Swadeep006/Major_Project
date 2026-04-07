import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { toast } from '@startlinks/react-native-toast';
import { format } from 'date-fns';
import { LogOut, User } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import { Header } from '@/components/common/Header';
import { WelcomeBanner } from '@/components/common/WelcomeBanner';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestCard } from '@/components/common/RequestCard';

export default function HODDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});


    // UI State


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

            if (parsedUser.role !== 'hod') {
                router.replace('/');
                return;
            }

            await fetchRequests(parsedUser.uid, parsedUser.department);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async (employeeId: string, department: string) => {
        try {
            const data = await api.getEmployeeRequests(employeeId, 'hod', department);
            if (Array.isArray(data)) {
                setRequests(data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch requests');
            setRequests([]);
        }
    };

    const handleAction = async (requestId: string, action: 'Accepted' | 'Rejected') => {
        try {
            const remarks = remarksMap[requestId] || '';

            await api.updateRequestStatus(requestId, 'hod', action, remarks, user?.name);

            toast.success(`Request ${action}`);
            if (user) fetchRequests(user.uid, user.department);

        } catch (error: any) {
            toast.error('Action failed: ' + error.message);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        } else {
            date = new Date(timestamp);
        }
        return format(date, 'M/d/yy, h:mm a');
    };

    const filteredRequests = Array.isArray(requests) ? requests : [];

    if (loading) {
        return <LoadingScreen message="Loading dashboard..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            <Header
                title="UniACE"
                userName={user?.name}
                onProfilePress={() => router.push('/HOD/profile')}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <WelcomeBanner
                    userName={user?.name}
                    role="HOD"
                />

                <View className="gap-4 pb-20">
                    <FlatList
                        data={filteredRequests}
                        keyExtractor={req => req.id}
                        scrollEnabled={false} // Since it's inside a ScrollView
                        ListEmptyComponent={<EmptyState title="No requests found" message="There are no gateway requests for you to review." />}
                        renderItem={({ item: req }) => (
                            <RequestCard
                                request={req}
                                status={req.hodStatus}
                                renderExtraDetails={() => (
                                    <View className="mt-2 flex-row">
                                        <Text className="text-sm font-medium">
                                            Forwarded Faculty: <Text className="font-normal text-muted-foreground">{req.inchargeName || 'Incharge'}</Text>
                                        </Text>
                                    </View>
                                )}
                                renderActions={() => (
                                    <>
                                        {req.hodStatus === 'Pending' && (
                                            <View className="mt-4 pt-2 border-t border-border/50">
                                                <View className="flex-row items-center gap-2 mb-3">
                                                    <Text className="text-xs font-bold text-muted-foreground">Remarks:</Text>
                                                    <TextInput
                                                        className="flex-1 h-9 border border-border rounded px-3 text-sm bg-muted/10 text-foreground"
                                                        placeholder={req.remarks || "Add HOD remarks..."}
                                                        placeholderTextColor="#9ca3af"
                                                        value={remarksMap[req.id] || req.remarks || ''}
                                                        onChangeText={(text) => setRemarksMap(prev => ({ ...prev, [req.id]: text }))}
                                                    />
                                                </View>
                                                <View className="flex-row gap-3">
                                                    <TouchableOpacity
                                                        className="flex-1 bg-background border border-border py-2.5 rounded-xl items-center"
                                                        onPress={() => handleAction(req.id, 'Rejected')}
                                                    >
                                                        <Text className="text-foreground font-bold">Reject</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        className="flex-1 bg-background border border-border py-2.5 rounded-xl items-center"
                                                        onPress={() => handleAction(req.id, 'Accepted')}
                                                    >
                                                        <Text className="text-foreground font-bold">Approve</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                        {req.hodStatus !== 'Pending' && (
                                            <View className="mt-2 pt-2 border-t border-border/50 flex-row">
                                                <Text className="text-sm text-muted-foreground">
                                                    Remarks: <Text className="text-foreground font-medium">{req.remarks || 'No remarks provided'}</Text>
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
