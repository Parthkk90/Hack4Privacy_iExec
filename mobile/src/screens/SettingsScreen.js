import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation, route }) {
  const walletAddress = route?.params?.walletAddress || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Format wallet address for display
  const formatAddress = (addr) => {
    if (!addr) return 'Not connected';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleDisconnectWallet = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? You will need to reconnect on next app launch.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('walletAddress');
              console.log('Wallet disconnected');
              // Navigate to Welcome screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error disconnecting wallet:', error);
              Alert.alert('Error', 'Failed to disconnect wallet');
            }
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Account Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={32} color="#2196F3" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Trader</Text>
            <Text style={styles.profileAddress}>{formatAddress(walletAddress)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              Alert.alert('Wallet Address', walletAddress, [
                { text: 'Copy', onPress: () => console.log('Copied:', walletAddress) },
                { text: 'Close' }
              ]);
            }}
          >
            <Text style={styles.editButtonText}>View</Text>
          </TouchableOpacity>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          
          <SettingItem 
            iconName="shield-checkmark"
            title="Credit Score"
            subtitle="View your trading credit score"
            onPress={() => navigation.getParent()?.navigate('CreditScore', { walletAddress })}
          />
          
          <SettingItem 
            iconName="wallet"
            title="Portfolio"
            subtitle="Manage your assets"
            onPress={() => navigation.navigate('Portfolio')}
          />
          
          <SettingItem 
            iconName="stats-chart"
            title="Trading History"
            subtitle="View past trades and performance"
            onPress={() => {}}
          />
        </View>
        
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <SettingToggle 
            iconName="notifications"
            title="Push Notifications"
            subtitle="Get alerts for trade opportunities"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          
          <SettingToggle 
            iconName="cash"
            title="Price Alerts"
            subtitle="Notify when targets are reached"
            value={priceAlertsEnabled}
            onValueChange={setPriceAlertsEnabled}
          />
          
          <SettingToggle 
            iconName="moon"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </View>
        
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
          
          <SettingToggle 
            iconName="finger-print"
            title="Biometric Auth"
            subtitle="Use fingerprint or Face ID"
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
          />
          
          <SettingItem 
            iconName="key"
            title="Change Wallet"
            subtitle="Connect a different wallet"
            onPress={handleDisconnectWallet}
          />
          
          <SettingItem 
            iconName="lock-closed"
            title="Privacy Settings"
            subtitle="Manage your data and privacy"
            onPress={() => {}}
          />
        </View>
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <SettingItem 
            iconName="information-circle"
            title="About PUREIS "
            subtitle="Learn more about the platform"
            onPress={() => {}}
          />
          
          <SettingItem 
            iconName="help-circle"
            title="Help & Support"
            subtitle="Get help and tutorials"
            onPress={() => {}}
          />
          
          <SettingItem 
            iconName="document-text"
            title="Terms & Privacy"
            subtitle="Read our policies"
            onPress={() => {}}
          />
        </View>
        
        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>PUREIS  v1.0.0</Text>
          <Text style={styles.versionSubtext}>Powered by iExec & Arbitrum</Text>
        </View>
        
        {/* Disconnect Button */}
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnectWallet}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function SettingItem({ iconName, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconBox}>
        <Ionicons name={iconName} size={20} color="#2196F3" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function SettingToggle({ iconName, title, subtitle, value, onValueChange }) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingIconBox}>
        <Ionicons name={iconName} size={20} color="#2196F3" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch 
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
        thumbColor={value ? '#2196F3' : '#9CA3AF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  profileAddress: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginLeft: 20,
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  versionSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  disconnectButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disconnectButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
});
