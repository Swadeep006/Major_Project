import React from 'react';
import { View } from 'react-native';
import { format } from 'date-fns';
import { MapPin, FileText, Calendar } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { StatusBadge, getStatusBorderColor } from './StatusBadge';

interface RequestCardProps {
    request: any;
    status: string; // The primary status to display (e.g. InchargeStatus, HODStatus, or Student Request status)
    renderActions?: () => React.ReactNode;
    renderExtraDetails?: () => React.ReactNode;
    onPress?: () => void;
}

export function RequestCard({ request, status, renderActions, renderExtraDetails, onPress }: RequestCardProps) {

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

    const statusColors = getStatusBorderColor(status || 'Pending').split(' ');
    const topBorderColor = statusColors[0];
    const cardBorderColor = statusColors[1] || 'border-border';

    return (
        <Card className={`mb-4 border shadow-sm overflow-hidden bg-white ${cardBorderColor}`}>
            <View className={`h-1 w-full ${topBorderColor}`} />
            <CardContent className="p-4">
                {/* Header Section */}
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                            <Text className="text-primary font-bold">{request.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View>
                            <Text className="text-base font-bold text-foreground">{request.name || 'Unknown'}</Text>
                            <Text className="text-xs text-muted-foreground">{request.rollNo || 'N/A'} • {request.yearSection || 'N/A'}</Text>
                        </View>
                    </View>
                    <StatusBadge status={status} />
                </View>

                {/* Id & Applied Section */}
                <View className="flex-row justify-between items-center mb-2 px-1">
                    <Text className="text-xs font-bold text-muted-foreground">ID: {(request.id || request.requestId || '').substring(0, 6)}</Text>
                    {request.stage && status === 'Pending' && (
                        <Text className="text-[10px] text-muted-foreground">Stage: {request.stage}</Text>
                    )}
                </View>

                {/* Details Section */}
                <View className="bg-muted/30 p-3 rounded-lg space-y-2 mb-4">
                    <View className="flex-row items-center gap-2">
                        <Icon as={MapPin} size={14} className="text-muted-foreground" />
                        <Text className="text-sm font-medium flex-1">Destination: <Text className="text-foreground">{request.destination || 'N/A'}</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Icon as={FileText} size={14} className="text-muted-foreground" />
                        <Text className="text-sm font-medium flex-1">Reason: <Text className="text-foreground">{request.reason || 'N/A'}</Text></Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Icon as={Calendar} size={14} className="text-muted-foreground" />
                        <Text className="text-xs text-muted-foreground flex-1">Applied: {formatDate(request.createdAt)}</Text>
                    </View>
                </View>

                {renderExtraDetails && renderExtraDetails()}

                {/* Action Area */}
                {renderActions && renderActions()}
            </CardContent>
        </Card>
    );
}
