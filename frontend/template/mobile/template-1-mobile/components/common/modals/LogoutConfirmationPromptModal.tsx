import { AlertTriangle } from 'lucide-react-native';
import {
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface LogoutConfirmationPromptModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout: () => void;
}


export default function LogoutConfirmationPromptModal({ visible, onClose, onLogout, ...props }: LogoutConfirmationPromptModalProps) {
    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
            >
                <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
                    <View className="bg-slate-800 rounded-3xl p-6 w-full border border-slate-700">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 rounded-full bg-amber-500/20 items-center justify-center mb-3">
                                <AlertTriangle size={32} color="#F59E0B" />
                            </View>
                            <Text className="text-white text-xl font-bold text-center">
                                Are you sure to Logout?
                            </Text>
                            <Text className="text-slate-400 text-sm text-center mt-2 leading-5">
                                Your data will be lost if you logout now. Are you sure?
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => onLogout()}
                            activeOpacity={0.8}
                            className="bg-red-600 rounded-2xl py-4 mb-3 items-center"
                        >
                            <Text className="text-white font-bold text-base">Logout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onClose()}
                            activeOpacity={0.8}
                            className="bg-slate-700 rounded-2xl py-4 items-center border border-slate-600"
                        >
                            <Text className="text-slate-200 font-bold text-base">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};