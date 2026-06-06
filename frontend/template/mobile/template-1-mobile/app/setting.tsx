import LogoutConfirmationPromptModal from '@/components/common/modals/LogoutConfirmationPromptModal';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingScreen() {
    const { user, logout } = useAuthContext();
    const router = useRouter();
    const [showLogoutConfirmationPrompt, setShowLogoutConfirmationPrompt] = useState(false);

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
                <View className="bg-white p-5 shadow-md flex-row items-center">
                    <Text className="text-3xl font-bold text-gray-900">設定</Text>
                </View>
                <View className="px-5 mb-6">
                    <TouchableOpacity
                        className="bg-white flex-row items-center justify-center p-4 rounded-xl border-2 border-red-500"
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color="#ff3b30" />
                        <Text className="text-base font-semibold text-red-500 ml-2">登出</Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center py-8">
                    <Text className="text-xs text-gray-500">© 1pcreeper project office App</Text>
                </View>
            </ScrollView>
            <LogoutConfirmationPromptModal
                visible={showLogoutConfirmationPrompt}
                onClose={() => setShowLogoutConfirmationPrompt(false)}
                onLogout={handleLogoutConfirm}
            />
        </SafeAreaView >
    );
}
