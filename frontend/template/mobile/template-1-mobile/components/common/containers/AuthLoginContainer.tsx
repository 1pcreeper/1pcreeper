import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AuthLoginContainer() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthContext();

    const handleLogin = async () => {
        if (!username || !password) {
            setError('請輸入用戶名和密碼');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(username, password);
        } catch (err) {
            setError('登入失敗，請檢查您的用戶名和密碼');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-100"
        >
            <View className="flex-1 justify-center p-6">
                <View className="items-center mb-12">
                    <Text className="text-4xl font-bold text-blue-500 mb-2">English Learning</Text>
                    <Text className="text-lg text-gray-600">登入您的帳戶</Text>
                </View>

                <View className="bg-white rounded-2xl p-6 shadow-lg">
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2">用戶名</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
                            placeholder="請輸入用戶名"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-800 mb-2">密碼</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl p-4 text-base border border-gray-200"
                            placeholder="請輸入密碼"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {error ? <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text> : null}

                    <TouchableOpacity
                        className={`bg-blue-500 rounded-xl p-4 items-center mb-6 ${loading ? 'opacity-60' : ''}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">登入</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}