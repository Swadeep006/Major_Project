import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
    return (
        <View className="flex-1 justify-center items-center bg-background">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-4 text-muted-foreground">{message}</Text>
        </View>
    );
}
