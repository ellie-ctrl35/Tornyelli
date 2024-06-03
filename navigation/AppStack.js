// AppStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './Bottomtabs'; // Assuming BottomTabs.js is in the same directory
import AddReminder from '../screens/App/AddReminder';
import UserProfile from '../screens/Auth/UserProfile';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTabs">
      <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddReminder" component={AddReminder} options={{ headerShown: false }}/>
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
};

export default AppStack;
