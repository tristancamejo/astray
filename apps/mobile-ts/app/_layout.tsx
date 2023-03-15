import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

export default function AppLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen
				name="index"
				options={{
					headerTitle: 'Home',
					tabBarLabel: 'Home',
					tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} />,
				}}
			/>
		</Tabs>
	);
}
