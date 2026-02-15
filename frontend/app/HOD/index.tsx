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
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">UniACE</Text>
                <TouchableOpacity onPress={() => router.push('/HOD/profile')}>
                    <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                        <Text className="text-xs font-bold">{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Tabs */}

            <View className='py-6 px-4 border border-white rounded-xl'>
                <Text className="text-sm text-muted-foreground font-medium">Welcome back,</Text>
                <Text className="text-2xl text-white font-bold mt-1">{user?.name || 'Incharge'}</Text>
                <View className="flex-row items-center mt-2 bg-gray-100 self-start px-2 py-1 rounded-md">
                    <Icon as={User} size={12} className="text-muted-foreground mr-1" />
                    <Text className="text-xs text-muted-foreground font-medium">Role: HOD</Text>
                </View>
            </View>

            <FlatList
                data={filteredRequests}
                keyExtractor={req => req.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Text className="text-muted-foreground">No requests found</Text>
                    </View>
                }

                renderItem={({ item: req }) => (
                    <Card className="mb-4 border border-border shadow-sm">
                        <CardContent className="p-4">
                            <View className="flex-row justify-between">
                                {/* Left Column */}
                                <View className="flex-1 space-y-1">
                                    <Text className="text-xs font-bold">Request Id : {(req.id || '').substring(0, 4)}</Text>
                                    <Text className="text-xs text-muted-foreground">Applied On : {formatDate(req.createdAt)}</Text>
                                    <Text className="text-xs font-medium">Reason : {req.reason || 'N/A'}</Text>
                                    <Text className="text-xs text-muted-foreground">Destination : {req.destination || 'N/A'}</Text>

                                    {/* Forwarded Faculty Name Display */}
                                    <Text className="text-xs font-medium mt-1">
                                        Forwarded Faculty : <Text className="font-normal text-muted-foreground">{req.inchargeName || 'Incharge'}</Text>
                                    </Text>
                                </View>

                                {/* Right Column */}
                                <View className="flex-1 items-end space-y-1">
                                    <Text className="text-xs font-bold">Student Name: {req.name || 'Unknown'}</Text>
                                    <Text className="text-xs text-muted-foreground">Roll No : {req.rollNo || 'N/A'}</Text>
                                    <Text className="text-xs text-muted-foreground">Year&Section : {req.yearSection || 'N/A'}</Text>
                                    <Text className={`text-xs font-bold capitalize ${req.hodStatus === 'Accepted' ? 'text-green-600' :
                                        req.hodStatus === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {req.hodStatus || 'Pending'}
                                    </Text>
                                </View>
                            </View>

                            {/* Action Area - Only show if HOD Pending (and Request is open) */}
                            {req.hodStatus === 'Pending' && (
                                <View className="mt-4 pt-2 border-t border-border/50">
                                    <View className="flex-row items-center gap-2 mb-3">
                                        <Text className="text-xs font-bold">Remarks :</Text>
                                        <TextInput
                                            className="flex-1 h-8 border border-border rounded px-2 text-xs bg-muted/10"
                                            placeholder={req.remarks || "Add HOD remarks..."}
                                            value={remarksMap[req.id] || req.remarks || ''}
                                            onChangeText={(text) => setRemarksMap(prev => ({ ...prev, [req.id]: text }))}
                                        />
                                    </View>
                                    <View className="flex-row gap-3 justify-end">
                                        <TouchableOpacity
                                            className="bg-red-200 px-6 py-1 rounded-full"
                                            onPress={() => handleAction(req.id, 'Rejected')}
                                        >
                                            <Text className="text-red-700 text-xs font-bold">Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-green-200 px-6 py-1 rounded-full"
                                            onPress={() => handleAction(req.id, 'Accepted')}
                                        >
                                            <Text className="text-green-700 text-xs font-bold">Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Read-only Area - If not pending */}
                            {req.hodStatus !== 'Pending' && (
                                <View className="mt-2 pt-2 border-t border-border/50">
                                    <Text className="text-xs text-muted-foreground">
                                        Remarks: <Text className="text-foreground">{req.remarks || 'None'}</Text>
                                    </Text>
                                </View>
                            )}
                        </CardContent>
                    </Card>
                )}
            />
        </SafeAreaView>
    );
}
