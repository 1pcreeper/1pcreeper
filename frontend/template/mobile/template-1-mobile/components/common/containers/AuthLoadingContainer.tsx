import { ActivityIndicator, View } from "react-native";

export default function AuthLoadingContainer() {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}