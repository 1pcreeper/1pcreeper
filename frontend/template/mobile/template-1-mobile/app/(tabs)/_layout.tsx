import { HapticTab } from '@/components/haptic-tab';
import { Tabs } from 'expo-router';
import { Hop as Home, User2 } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarActiveTintColor: '#1D4ED8',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#F3F4F6',
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 84 : 64,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: -2 },
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: '首頁',
                    tabBarIcon: ({ color, focused }) => (
                        <Home color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.5 : 1.8} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: '個人',
                    tabBarIcon: ({ color, focused }) => (
                        <User2 color={color} size={focused ? 22 : 20} strokeWidth={focused ? 2.5 : 1.8} />
                    ),
                }}
            />
        </Tabs>
    );
}
