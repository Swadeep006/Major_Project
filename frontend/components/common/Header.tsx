import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';

interface HeaderProps {
    title?: string;
    userName?: string;
    onProfilePress: () => void;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function Header({ title = 'UniACE', userName, onProfilePress, showBackButton, onBackPress }: HeaderProps) {
    return (
        <View className="px-4 py-3 flex-row justify-between items-center mb-4 z-10 bg-background">
            <View className="flex-row items-center gap-2">
                {showBackButton && onBackPress && (
                    <TouchableOpacity onPress={onBackPress} className="mr-2">
                        <Text className="text-xl font-bold">←</Text>
                    </TouchableOpacity>
                )}
                <Text className="text-xl font-bold text-foreground">{title}</Text>
            </View>
            <TouchableOpacity onPress={onProfilePress}>
                <View className="w-8 h-8 rounded-full bg-yellow-400 items-center justify-center">
                    <Text className="text-xs font-bold text-black">{userName?.charAt(0) || 'U'}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
