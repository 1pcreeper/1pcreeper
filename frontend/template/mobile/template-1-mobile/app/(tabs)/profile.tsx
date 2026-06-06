import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, logout } = useAuthContext();
    const router = useRouter();
    const [showLogoutConfirmationPrompt, setShowLogoutConfirmationPrompt] = useState(false);
    const [roleNames, setRoleNames] = useState<string[]>(["Admin", "User"]);


    const handleLogout = async () => {
        setShowLogoutConfirmationPrompt(true);
    };
    const handleLogoutConfirm = async () => {
        setShowLogoutConfirmationPrompt(false);
        await logout();
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-5 shadow-md flex-row items-center justify-between">
                    <Text className="text-3xl font-bold text-gray-900">個人</Text>
                    <TouchableOpacity onPress={() => router.push('/setting')}>
                        <Settings size={35} color="#3B82F6" className="self-end" />
                    </TouchableOpacity>
                </View>

                <View className="p-5">
                    <View className="bg-white rounded-2xl p-5 flex-row items-center shadow-lg">
                        <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full mr-4" />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 mb-1">User</Text>
                            <Text className="text-sm text-gray-600 mb-2">{"example@example.com"}</Text>
                            <View className="flex-row gap-2">
                                <View className="bg-blue-500 px-2 py-1 rounded-lg">
                                    <Text className="text-xs font-semibold text-white">ID: 1</Text>
                                </View>
                                {
                                    roleNames.map((role) => (
                                        <View key={role} className="bg-yellow-500 px-2 py-1 rounded-lg">
                                            <Text className="text-xs font-semibold text-white">{role.toLowerCase()}</Text>
                                        </View>
                                    ))
                                }
                            </View>
                        </View>
                    </View>
                </View>

                <View className="items-center py-8">
                    <Text className="text-xs text-gray-500">© 1pcreeper project office App</Text>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
