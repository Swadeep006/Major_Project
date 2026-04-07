import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from '@startlinks/react-native-toast';
import { format } from 'date-fns';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Header } from '@/components/common/Header';
import { RequestCard } from '@/components/common/RequestCard';

export default function SecurityDashboard() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifiedRequest, setVerifiedRequest] = useState<any>(null);

    const handleVerify = async () => {
        if (!code || code.length < 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setVerifying(true);
        setVerifiedRequest(null);

        try {
            const data = await api.verifyCode(code);
            if (data.valid) {
                // verifyCode backend now returns full data spread
                // map 'name' to 'studentName' if needed, or use as returned
                setVerifiedRequest(data);
                toast.success('Code Verified');
            } else {
                toast.error('Invalid Code');
            }
        } catch (error: any) {
            toast.error(error.message || 'Verification Failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleMarkExit = async () => {
        if (!verifiedRequest) return;

        try {
            await api.markExit(verifiedRequest.requestId);
            toast.success('Exit Logged Successfully');
            setVerifiedRequest(null);
            setCode('');
        } catch (error: any) {
            toast.error('Failed to log exit: ' + error.message);
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

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            <Header
                title="UniACE"
                userName="Security"
                onProfilePress={() => router.push('/security/profile')}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <Text className="text-xl font-bold mb-4 tracking-widest">ENTER CODE</Text>

                    <Input
                        className="w-full h-12 text-center text-lg border-2 border-primary/20 rounded-xl mb-6 bg-white"
                        placeholder="e.g. 123456"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={code}
                        onChangeText={setCode}
                    />

                    <Button className="w-full bg-primary rounded-xl h-12 mb-6" onPress={handleVerify} disabled={verifying}>
                        {verifying ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold tracking-widest text-lg">VERIFY</Text>
                        )}
                    </Button>
                </View>

                {verifiedRequest && (
                    <View className="mb-6">
                        <RequestCard
                            request={verifiedRequest}
                            status={verifiedRequest.status || 'Accepted'}
                            renderExtraDetails={() => (
                                <View>
                                    <Text className="text-xs text-muted-foreground mt-2">
                                        Forwarded HOD: <Text className="text-primary font-medium">{verifiedRequest.hodName || 'HOD'}</Text>
                                    </Text>
                                    <View className="border border-border rounded-lg p-2 mt-1 mb-2 bg-muted/10">
                                        <Text className="text-xs font-medium">Remarks : <Text className="font-normal">{verifiedRequest.remarks || 'None'}</Text></Text>
                                    </View>
                                </View>
                            )}
                            renderActions={() => (
                                <View className="mt-4 pt-4 border-t-2 border-dashed border-border/50">
                                    <Button className="w-full bg-primary rounded-xl" onPress={handleMarkExit}>
                                        <Text className="text-primary-foreground font-bold tracking-widest">ALLOW EXIT</Text>
                                    </Button>
                                </View>
                            )}
                        />
                    </View>
                )}

                <TouchableOpacity
                    className="self-center mt-4"
                    onPress={() => router.push('/security/history')}
                >
                    <Text className="text-muted-foreground underline border">View History</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
