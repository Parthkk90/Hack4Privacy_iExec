import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

// Custom Tab Bar Button for center action
function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00d4aa',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00d4aa',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

// Tab Navigator with 5 tabs
function MainTabs({ route }) {
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
          backgroundColor: '#1a1a2e',
          borderTopColor: '#252545',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00d4aa',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        initialParams={{ scoreData, walletAddress }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color, fontSize: focused ? 26 : 24 }]}>🏠</Text>
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Markets" 
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color, fontSize: focused ? 26 : 24 }]}>📊</Text>
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Trade" 
        component={DashboardScreen}
        initialParams={{ scoreData, walletAddress }}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 28, color: '#000' }}>⚡</Text>
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color, fontSize: focused ? 26 : 24 }]}>💼</Text>
            </View>
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color, fontSize: focused ? 26 : 24 }]}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f0f1e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#0f0f1e',
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
          options={{ 
            title: 'Credit Analysis',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={MainTabs}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Strategy" 
          component={StrategyScreen}
          options={{ 
            title: 'Strategy Details',
            headerBackTitle: 'Back'
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

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
