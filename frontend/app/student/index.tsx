import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { toast } from '@startlinks/react-native-toast';
import { format } from 'date-fns';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Header } from '@/components/common/Header';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestCard } from '@/components/common/RequestCard';

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Data
    const [requests, setRequests] = useState<any[]>([]);
    const [facultyList, setFacultyList] = useState<any[]>([]);

    // Form State
    const [reason, setReason] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);

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

            // Fetch Faculty
            const faculty = await api.getFacultyList(parsedUser.department);
            setFacultyList(faculty);

            // Fetch Requests
            const myRequests = await api.getStudentRequests(parsedUser.uid);
            if (Array.isArray(myRequests)) {
                setRequests(myRequests);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const refreshRequests = async () => {
        if (user) {
            try {
                const myRequests = await api.getStudentRequests(user.uid);
                if (Array.isArray(myRequests)) {
                    setRequests(myRequests);
                }
            } catch (error) {
                console.error("Failed to refresh requests", error);
            }
        }
    }

    const handleApply = async () => {
        if (!reason || !destination || !selectedFaculty) {
            toast.error('Validation: Please fill all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createRequest({
                studentId: user.uid,
                studentName: user.name,
                rollNo: user.rollNumber,
                department: user.department,
                yearSection: user.yearSection,
                reason,
                destination,
                inchargeId: selectedFaculty.id,
                inchargeName: selectedFaculty.name
            });

            toast.success('Request submitted successfully!');
            setReason('');
            setDestination('');
            setSelectedFaculty(null);
            refreshRequests();
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
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
                onProfilePress={() => router.push('/student/profile')}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Application Form */}
                <Card className="mb-6 border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">New Gateway Request</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Label nativeID="reason">Reason</Label>
                            <Input
                                placeholder="e.g. Stomach Pain"
                                value={reason}
                                onChangeText={setReason}
                            />
                        </View>
                        <View>
                            <Label nativeID="destination">Destination</Label>
                            <Input
                                placeholder="e.g. Home"
                                value={destination}
                                onChangeText={setDestination}
                            />
                        </View>
                        <View>
                            <Label>Faculty</Label>
                            <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between flex-row items-center px-3">
                                        <Text className={selectedFaculty ? "text-foreground" : "text-muted-foreground"}>
                                            {selectedFaculty ? selectedFaculty.name : "Select Faculty"}
                                        </Text>
                                        <ChevronDown size={16} className="text-muted-foreground opacity-50" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80%] w-[90%] p-0 overflow-hidden bg-background rounded-lg border border-border pb-6">
                                    <DialogHeader className="px-6 pt-6 pb-2">
                                        <DialogTitle>Select Faculty</DialogTitle>
                                    </DialogHeader>
                                    <View className="h-72 w-full mt-2">
                                        <FlatList
                                            data={facultyList || []}
                                            keyExtractor={item => item?.id || Math.random().toString()}
                                            contentContainerStyle={{ paddingBottom: 20 }}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    className="px-6 py-4 border-b border-border active:bg-accent flex-row justify-between items-center"
                                                    onPress={() => {
                                                        setSelectedFaculty(item);
                                                        setIsFacultyDialogOpen(false);
                                                    }}
                                                >
                                                    <View>
                                                        <Text className="font-semibold text-base">{item?.name || 'Unknown'}</Text>
                                                        <Text className="text-sm text-muted-foreground mt-0.5">{item?.department || 'N/A'}</Text>
                                                    </View>
                                                    {selectedFaculty?.id === item.id && (
                                                        <View className="h-2 w-2 rounded-full bg-primary" />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                </DialogContent>
                            </Dialog>
                        </View>

                        <Button onPress={handleApply} disabled={isSubmitting} className="mt-2">
                            <Text>{isSubmitting ? 'Applying...' : 'APPLY'}</Text>
                        </Button>
                    </CardContent>
                </Card>

                {/* Filter Tabs */}


                {/* Requests List */}
                <View className="gap-4 pb-20">
                    {filteredRequests.map((req, index) => (
                        <RequestCard
                            key={`${req.id || 'req'}-${index}`}
                            request={req}
                            status={req.status}
                            renderExtraDetails={() => (
                                <View>
                                    {req.uniqueCode && (
                                        <View className="mt-4 bg-white/50 p-2 rounded border border-dashed border-primary">
                                            <Text className="font-bold text-xl text-center text-primary tracking-widest">{req.uniqueCode}</Text>
                                            <Text className="text-[10px] text-center text-muted-foreground">Use this code at security</Text>
                                        </View>
                                    )}
                                    <View className="mt-2 pt-2 border-t border-border/50">
                                        {req.remarks ? (
                                            <Text className="text-sm text-red-500 font-medium">Remarks: {req.remarks}</Text>
                                        ) : null}
                                        <View className="flex-row justify-between mt-1 pt-1">
                                            <Text className="text-[10px] text-muted-foreground">
                                                {format(req.createdAt?._seconds ? new Date(req.createdAt._seconds * 1000) : new Date(req.createdAt || 0), 'MMM d, h:mm a')}
                                            </Text>
                                            <Text className="text-[10px] text-muted-foreground text-right">
                                                To: {
                                                    (facultyList && Array.isArray(facultyList)
                                                        ? facultyList.find(f => f.id === req.inchargeId)?.name
                                                        : null
                                                    ) || 'Faculty'
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    ))}
                    {filteredRequests.length === 0 && (
                        <EmptyState title="No requests found" message="You haven't submitted any gateway requests yet." />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
