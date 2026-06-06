import { Text, View } from "react-native";

interface EventCardProps {
    title: string;
    time: string;
    body: string;
    accent: string;
}

const EventCard = ({ title, time, body, accent }: EventCardProps) => {
    return (
        <View
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}
        >
            <View className="flex-row items-start">
                <View className="w-1 rounded-full self-stretch mr-3 mt-0.5" style={{ backgroundColor: accent }} />
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>{title}</Text>
                        <Text className="text-xs text-gray-400">{time}</Text>
                    </View>
                    <Text className="text-xs text-gray-500 leading-4">{body}</Text>
                </View>
            </View>
        </View>
    );
}

export default EventCard;