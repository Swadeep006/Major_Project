import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LogOut, User } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface WelcomeBannerProps {
    userName: string;
    role: string;
    onLogout?: () => void;
}

export function WelcomeBanner({ userName, role, onLogout }: WelcomeBannerProps) {
    return (
        <View className="bg-primary/10 p-4 rounded-2xl mb-6 border border-primary/20 bg-white shadow-sm">
            <View className="flex-row justify-between items-start">
                <View>
                    <Text className="text-sm text-muted-foreground font-medium">Welcome back,</Text>
                    <Text className="text-2xl text-black font-bold mt-1">{userName || 'User'}</Text>
                    <View className="flex-row items-center mt-2 bg-gray-100 self-start px-2 py-1 rounded-md">
                        <Icon as={User} size={12} className="text-muted-foreground mr-1" />
                        <Text className="text-xs text-muted-foreground font-medium capitalize">Role: {role}</Text>
                    </View>
                </View>
                {onLogout && (
                    <TouchableOpacity
                        onPress={onLogout}
                        className="bg-white p-2 rounded-full shadow-sm border border-gray-100"
                    >
                        <Icon as={LogOut} size={20} className="text-red-500" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
