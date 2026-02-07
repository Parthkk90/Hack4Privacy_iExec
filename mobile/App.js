import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Platform, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import CreditScoreScreen from './src/screens/CreditScoreScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StrategyScreen from './src/screens/StrategyScreen';
import ExecutionScreen from './src/screens/ExecutionScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator with 4 tabs
function MainTabs({ route, navigation }) {
  const { scoreData, walletAddress } = route.params || {};
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 65 : 70,
          paddingBottom: Platform.OS === 'android' ? 8 : 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        initialParams={{ scoreData, walletAddress }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Markets" 
        component={StrategyScreen}
        initialParams={{ scoreData, walletAddress }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "analytics" : "analytics-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Score" 
        component={CreditScoreScreen}
        initialParams={{ walletAddress }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "bar-chart" : "bar-chart-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={SettingsScreen}
        initialParams={{ walletAddress }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const [initialParams, setInitialParams] = useState({});

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const savedWallet = await AsyncStorage.getItem('walletAddress');
      console.log('Checking saved wallet:', savedWallet);
      
      // Always show Welcome screen first for demo/submission
      setInitialRoute('Welcome');
      if (savedWallet) {
        setInitialParams({ walletAddress: savedWallet });
        console.log('Wallet found in storage, will auto-connect');
      } else {
        console.log('No saved wallet, showing Welcome screen');
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setInitialRoute('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#f8f9fa',
          },
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={MainTabs}
          initialParams={initialParams}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreditScore" 
          component={CreditScoreScreen}
          options={{ 
            title: 'Credit Analysis',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="Strategy" 
          component={StrategyScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Execution" 
          component={ExecutionScreen}
          options={{ 
            title: 'Executing Trade',
            headerBackTitle: 'Back'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
