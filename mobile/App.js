import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import CreditScoreScreen from './src/screens/CreditScoreScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StrategyScreen from './src/screens/StrategyScreen';
import ExecutionScreen from './src/screens/ExecutionScreen';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreditScore" 
            component={CreditScoreScreen}
            options={{ title: 'Credit Score Analysis' }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'PrivateAlpha' }}
          />
          <Stack.Screen 
            name="Strategy" 
            component={StrategyScreen}
            options={{ title: 'Strategy Details' }}
          />
          <Stack.Screen 
            name="Execution" 
            component={ExecutionScreen}
            options={{ title: 'Trade Execution' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
