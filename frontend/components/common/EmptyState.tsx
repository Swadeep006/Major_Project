import React from 'react';
import { View } from 'react-native';
import { Filter } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
    title?: string;
    message?: string;
}

export function EmptyState({ title = "No Results Found", message = "There is nothing here at the moment." }: EmptyStateProps) {
    return (
        <View className="items-center justify-center py-20 px-10">
            <View className="w-20 h-20 bg-muted/30 rounded-full items-center justify-center mb-4">
                <Icon as={Filter} size={40} className="text-muted-foreground/50" />
            </View>
            <Text className="text-lg font-bold text-foreground mb-2 text-center">{title}</Text>
            <Text className="text-center text-muted-foreground">{message}</Text>
        </View>
    );
}
