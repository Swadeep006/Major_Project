import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return 'text-green-600 bg-green-100';
            case 'Rejected': return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    const renderHeader = () => (
        <View className="px-4 pt-1 mb-4">
            <View className="bg-primary/10 p-4 rounded-2xl mb-6 border border-primary/20 bg-white shadow-sm">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-sm text-muted-foreground font-medium">Welcome back,</Text>
                        <Text className="text-2xl text-black font-bold mt-1">{user?.name || 'Incharge'}</Text>
                        <View className="flex-row items-center mt-2 bg-gray-100 self-start px-2 py-1 rounded-md">
                            <Icon as={User} size={12} className="text-muted-foreground mr-1" />
                            <Text className="text-xs text-muted-foreground font-medium">Role: Incharge</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-white p-2 rounded-full shadow-sm border border-gray-100"
                    >
                        <Icon as={LogOut} size={20} className="text-red-500" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Summary */}
            <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-yellow-600">
                        {requests.filter(r => r.inchargeStatus === 'Pending').length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Pending</Text>
                </View>
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-green-600">
                        {requests.filter(r => r.inchargeStatus === 'Accepted').length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Approved</Text>
                </View>
                <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm items-center">
                    <Text className="text-2xl font-bold text-primary">
                        {requests.length}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">Total</Text>
                </View>
            </View>

            {/* Custom Tabs */}

        </View>
    );

    const renderItem = ({ item: req }: { item: any }) => (
        <Card className="mx-4 mb-4 border border-border shadow-sm overflow-hidden bg-card">
            <View className={`h-1 w-full ${req.inchargeStatus === 'Accepted' ? 'bg-green-500' :
                req.inchargeStatus === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
            <CardContent className="p-4">
                {/* Header Section */}
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                            <Text className="text-primary font-bold">{req.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View>
                            <Text className="text-base font-bold text-foreground">{req.name || 'Unknown'}</Text>
                            <Text className="text-xs text-muted-foreground">{req.rollNo || 'N/A'} • {req.yearSection || 'N/A'}</Text>
                        </View>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${getStatusColor(req.inchargeStatus || 'Pending').split(' ')[1]}`}>
                        <Text className={`text-xs font-bold ${getStatusColor(req.inchargeStatus || 'Pending').split(' ')[0]}`}>
                            {req.inchargeStatus || 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Details Section */}
                <View className="bg-muted/30 p-3 rounded-lg space-y-2 mb-4">
                    <View className="flex-row items-center gap-2">
                        <Icon as={MapPin} size={14} className="text-muted-foreground" />
                        <Text className="text-sm font-medium flex-1">Destination: <Text className="text-foreground">{req.destination || 'N/A'}</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Icon as={FileText} size={14} className="text-muted-foreground" />
                        <Text className="text-sm font-medium flex-1">Reason: <Text className="text-foreground">{req.reason || 'N/A'}</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Icon as={Calendar} size={14} className="text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground flex-1">Applied: {formatDate(req.createdAt)}</Text>
                    </View>
                </View>

                {/* Action Area */}
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
                                className="flex-1 bg-red-50 border border-red-200 py-3 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleAction(req.id, 'Rejected')}
                            >
                                <Icon as={XCircle} size={18} className="text-red-600" />
                                <Text className="text-red-700 font-bold">Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-green-50 border border-green-200 py-3 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleAction(req.id, 'Accepted')}
                            >
                                <Icon as={CheckCircle} size={18} className="text-green-600" />
                                <Text className="text-green-700 font-bold">Approve</Text>
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
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#000" />
                <Text className="mt-4 text-muted-foreground">Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header Title Bar */}
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between bg-background z-10">
                <View className="flex-row items-center gap-2">

                    <Text className="text-lg font-bold text-foreground">Incharge Portal</Text>

                </View>
                <TouchableOpacity onPress={() => router.push('/incharge/profile')}>
                    <View className="w-8 h-8 rounded-full bg-gray-400 items-center justify-center">
                        <Text className="text-xs font-bold">{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredRequests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 px-10">
                        <View className="w-20 h-20 bg-muted/30 rounded-full items-center justify-center mb-4">
                            <Icon as={Filter} size={40} className="text-muted-foreground/50" />
                        </View>
                        <Text className="text-lg font-bold text-foreground mb-2">No Requests Found</Text>
                        <Text className="text-center text-muted-foreground">
                            There are no requests at the moment.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
