import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface RecommendCardProps {
    title: string;
    bodyText: string;
    tag: string;
    actionText: string;
}


export default function RecommendCard({ title, bodyText, tag, actionText }: RecommendCardProps) {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.push('/(tabs)/home' as any)}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-3"
            style={{ backgroundColor: '#1E3A5F' }}
        >
            <View className="p-5">
                <View className="inline-flex flex-row mb-3">
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.3)' }}>
                        <Text className="text-xs font-semibold" style={{ color: '#BFDBFE' }}>{tag}</Text>
                    </View>
                </View>
                <Text className="text-white text-lg font-bold mb-1">{title}</Text>
                <Text className="text-sm leading-5" style={{ color: '#93C5FD' }}>
                    {bodyText}
                </Text>
                <View className="flex-row items-center mt-4">
                    <Text className="text-sm font-semibold mr-1" style={{ color: '#60A5FA' }}>{actionText}</Text>
                    <ChevronRight size={16} color="#93C5FD" />
                </View>
            </View>
        </TouchableOpacity>
    );
}