import EventCard from '@/components/common/cards/EventCard';
import RecommendCard from '@/components/common/cards/RecommendCard';
import { useAuthContext } from '@/contexts/AuthContext';
import "@/global.css";
import { router } from 'expo-router';
import {
    Layers,
    Trophy
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const QUICK_ACTIONS = [
    { icon: Layers, label: 'option', sublabel: 'option', color: '#3B82F6', bg: '#EFF6FF', route: '/(tabs)/home' },
    { icon: Layers, label: 'option', sublabel: 'option', color: '#10B981', bg: '#F0FDF4', route: '/(tabs)/home' },
    { icon: Layers, label: 'option', sublabel: 'option', color: '#F59E0B', bg: '#FFFBEB', route: '/(tabs)/home' },
    { icon: Layers, label: 'option', sublabel: 'option', color: '#EF4444', bg: '#FEF2F2', route: '(tabs)/home' },
];

const EVENTS = [
    { title: 'Event', time: '2 hours ago', body: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', accent: '#3B82F6' },
    { title: 'Event', time: '1 day ago', body: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', accent: '#10B981' },
    { title: 'Event', time: '3 days ago', body: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accent: '#F59E0B' },
];

export default function HomeScreen() {
    const { user } = useAuthContext();
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return '早安';
        if (h < 18) return '午安';
        return '晚安';
    })();

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Banner */}
            <View style={{ backgroundColor: '#1D4ED8' }} className="px-6 pt-6 pb-12">
                <View className="flex-row items-center justify-between mb-5">
                    <View className="mt-6">
                        <Text style={{ color: '#BFDBFE' }} className="text-sm font-medium">{greeting}！</Text>
                        <Text className="text-white text-2xl font-bold mt-0.5">
                            {'User'}
                        </Text>
                    </View>
                    <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <Trophy size={24} color="white" />
                    </View>
                </View>

            </View>

            {/* Quick Actions card overlapping hero */}
            <View className="mx-4 -mt-6 bg-white rounded-3xl border border-gray-100 p-4 mb-6" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 }}>
                <Text className="text-sm font-bold text-gray-900 mb-4">Quick Actions</Text>
                <View className="flex-row justify-between">
                    {QUICK_ACTIONS.map((qa, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => router.push(qa.route as any)}
                            activeOpacity={0.7}
                            className="items-center flex-1"
                        >
                            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: qa.bg }}>
                                <qa.icon size={22} color={qa.color} />
                            </View>
                            <Text className="text-xs font-bold text-gray-800">{qa.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recommended */}
            <View className="px-4 mb-6">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-bold text-gray-900">Recommended</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/exercise' as any)} activeOpacity={0.7}>
                        <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>See All</Text>
                    </TouchableOpacity>
                </View>

                <RecommendCard title="XXXXX" bodyText="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" actionText='YYYYY' tag='tag' />
                <RecommendCard title="XXXXX" bodyText="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" actionText='YYYYY' tag='tag' />
            </View>

            {/* Latest Updates */}
            <View className="px-4 mb-10">
                <Text className="text-base font-bold text-gray-900 mb-3">Latest Updates</Text>
                {EVENTS.map((item, i) => (
                    <EventCard key={i} title={item.title} time={item.time} body={item.body} accent={item.accent} />
                ))}
            </View>
        </ScrollView>
    );
}
