import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, TextInput, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { toast } from '@startlinks/react-native-toast';
import { format } from 'date-fns';
import { LogOut, User, CheckCircle, XCircle, Clock, MapPin, FileText, Calendar, Filter } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Icon } from '@/components/ui/icon';
import { Header } from '@/components/common/Header';
import { WelcomeBanner } from '@/components/common/WelcomeBanner';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestCard } from '@/components/common/RequestCard';

export default function InchargeDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
    const [refreshing, setRefreshing] = useState(false);

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

            if (parsedUser.role !== 'incharge') {
                router.replace('/');
                return;
            }

            await fetchRequests(parsedUser.uid);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRequests = async (employeeId: string) => {
        try {
            const data = await api.getEmployeeRequests(employeeId, 'incharge');
            if (Array.isArray(data)) {
                // Sort by date (newest first)
                const sortedData = data.sort((a: any, b: any) => {
                    const dateA = a.createdAt?._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(a.createdAt || 0);
                    const dateB = b.createdAt?._seconds ? new Date(b.createdAt._seconds * 1000) : new Date(b.createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                });
                setRequests(sortedData);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch requests');
            setRequests([]);
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

    const handleAction = async (requestId: string, action: 'Accepted' | 'Rejected') => {
        try {
            const remarks = remarksMap[requestId] || '';

            // Optimistic update
            const updatedRequests = requests.map(req =>
                req.id === requestId ? { ...req, inchargeStatus: action, remarks: remarks } : req
            );
            setRequests(updatedRequests);

            await api.updateRequestStatus(requestId, 'incharge', action, remarks, user?.name);

            toast.success(`Request ${action}`);
            fetchRequests(user.uid); // Refresh to be sure
        } catch (error: any) {
            toast.error('Action failed: ' + error.message);
            fetchRequests(user.uid); // Revert on error
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp._seconds) {
            date = new Date(timestamp._seconds * 1000);
        } else {
            date = new Date(timestamp);
        }
        return format(date, 'MMM d, yyyy • h:mm a');
    };

    const onRefresh = () => {
        setRefreshing(true);
        if (user) fetchRequests(user.uid);
    };

    const filteredRequests = Array.isArray(requests) ? requests : [];


    const renderHeader = () => (
        <View className="px-4 pt-1 mb-4">
            <WelcomeBanner
                userName={user?.name}
                role="Incharge"
                onLogout={handleLogout}
            />

            {/* Stats Summary */}
            <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-foreground">
                        {requests.filter(r => r.inchargeStatus === 'Pending').length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Pending</Text>
                </View>
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-foreground">
                        {requests.filter(r => r.inchargeStatus === 'Accepted').length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Approved</Text>
                </View>
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-foreground">
                        {requests.length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Total</Text>
                </View>
            </View>

            {/* Custom Tabs */}

        </View>
    );

    const renderItem = ({ item: req }: { item: any }) => (
        <RequestCard
            request={req}
            status={req.inchargeStatus}
            renderActions={() => (
                <>
                    {req.inchargeStatus === 'Pending' ? (
                        <View>
                            <Text className="text-xs font-semibold mb-2 ml-1 text-muted-foreground">Add Remarks & Action</Text>
                            <TextInput
                                className="bg-background border border-border rounded-lg p-3 text-sm mb-3 min-h-[40px] text-foreground"
                                placeholder="Enter remarks (optional)..."
                                placeholderTextColor="#9ca3af"
                                value={remarksMap[req.id] || ''}
                                onChangeText={(text) => setRemarksMap(prev => ({ ...prev, [req.id]: text }))}
                                multiline
                            />
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 bg-background border border-border py-3 rounded-xl items-center flex-row justify-center gap-2"
                                    onPress={() => handleAction(req.id, 'Rejected')}
                                >
                                    <Icon as={XCircle} size={18} className="text-foreground" />
                                    <Text className="text-foreground font-bold">Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-background border border-border py-3 rounded-xl items-center flex-row justify-center gap-2"
                                    onPress={() => handleAction(req.id, 'Accepted')}
                                >
                                    <Icon as={CheckCircle} size={18} className="text-foreground" />
                                    <Text className="text-foreground font-bold">Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="border-t border-border pt-3">
                            <Text className="text-xs text-muted-foreground">
                                Remarks: <Text className="text-foreground font-medium">{req.remarks || 'No remarks provided'}</Text>
                            </Text>
                        </View>
                    )}
                </>
            )}
        />
    );

    if (loading) {
        return <LoadingScreen message="Loading dashboard..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4" edges={['top']}>
            <Header
                title="Incharge Portal"
                userName={user?.name}
                onProfilePress={() => router.push('/incharge/profile')}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHeader()}

                <View className="gap-4 pb-20">
                    <FlatList
                        data={filteredRequests}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false} // Since it's inside a ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={
                            <EmptyState title="No Requests Found" message="There are no requests at the moment." />
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
