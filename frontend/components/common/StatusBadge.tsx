import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted':
            case 'Approved':
                return 'text-green-600 bg-green-100';
            case 'Rejected':
                return 'text-red-600 bg-red-100';
            case 'Completed':
                return 'text-blue-600 bg-blue-100';
            case 'Pending':
            default:
                return 'text-yellow-600 bg-yellow-100';
        }
    };

    const styleClasses = getStatusStyle(status);
    const textColor = styleClasses.split(' ')[0];

    return (
        <View className={`px-2 py-1 rounded-md ${styleClasses.split(' ')[1]}`}>
            <Text className={`text-xs font-bold ${textColor}`}>
                {status || 'Pending'}
            </Text>
        </View>
    );
}

export function getStatusBorderColor(status: string) {
    switch (status) {
        case 'Accepted':
        case 'Approved':
            return 'bg-green-500 border-green-200';
        case 'Rejected':
            return 'bg-red-500 border-red-200';
        case 'Completed':
            return 'bg-blue-500 border-blue-200';
        case 'Pending':
        default:
            return 'bg-yellow-500 border-yellow-200';
    }
}
