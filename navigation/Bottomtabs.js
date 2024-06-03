import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/App/HomeScreen';
import ChatScreen from '../screens/App/ChatScreen';
import ReminderScreen from '../screens/App/ReminderScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Import MaterialCommunityIcons

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const screenOptions = ({ route }) => ({
    tabBarShowLabel: false,
    headerShown: false,
    tabBarStyle: {
      height: '10%',
      elevation: 0,
      backgroundColor: '#191919',
      borderTopColor: 'transparent',
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (route.name === 'Home') {
        iconName = 'home';
      } else if (route.name === 'Chat') {
        iconName = 'chat';
      } else if (route.name === 'Reminder') {
        iconName = 'bell';
      }
      return (
        <MaterialCommunityIcons name={iconName} size={size} color={focused ? '#5ad7ff' : '#4B5563'} />
      );
    },
    tabBarActiveTintColor: '#FFFFFF',
    tabBarInactiveTintColor: '#4B5563',
  });

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen}  />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Reminder" component={ReminderScreen} options={{ tabBarBadge: 3 }}/>
    </Tab.Navigator>
  );
};

export default BottomTabs;
