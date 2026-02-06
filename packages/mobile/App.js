import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

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
        <StatusBar style="light" />
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
            options={{ title: 'Compute Credit Score' }}
          />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen
            name="Strategy"
            component={StrategyScreen}
            options={{ title: 'Strategy Details' }}
          />
          <Stack.Screen
            name="Execution"
            component={ExecutionScreen}
            options={{ title: 'Execute Trade' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
