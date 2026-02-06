import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileEmoji}>👤</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Anonymous User</Text>
          <Text style={styles.profileAddress}>0x742d...bEb</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem 
          icon="🔐"
          title="Credit Score"
          subtitle="View your trading credit score"
          onPress={() => navigation.navigate('CreditScore', { walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })}
        />
        
        <SettingItem 
          icon="💼"
          title="Portfolio"
          subtitle="Manage your assets"
          onPress={() => navigation.navigate('Portfolio')}
        />
        
        <SettingItem 
          icon="📊"
          title="Trading History"
          subtitle="View past trades and performance"
          onPress={() => {}}
        />
      </View>
      
      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <SettingToggle 
          icon="🔔"
          title="Push Notifications"
          subtitle="Get alerts for trade opportunities"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        
        <SettingToggle 
          icon="💰"
          title="Price Alerts"
          subtitle="Notify when targets are reached"
          value={priceAlertsEnabled}
          onValueChange={setPriceAlertsEnabled}
        />
        
        <SettingToggle 
          icon="🌙"
          title="Dark Mode"
          subtitle="Use dark theme"
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
        />
      </View>
      
      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        
        <SettingToggle 
          icon="👆"
          title="Biometric Authentication"
          subtitle="Use fingerprint or Face ID"
          value={biometricsEnabled}
          onValueChange={setBiometricsEnabled}
        />
        
        <SettingItem 
          icon="🔑"
          title="Change Wallet"
          subtitle="Connect a different wallet"
          onPress={() => {}}
        />
        
        <SettingItem 
          icon="🛡️"
          title="Privacy Settings"
          subtitle="Manage your data and privacy"
          onPress={() => {}}
        />
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <SettingItem 
          icon="ℹ️"
          title="About PrivateAlpha"
          subtitle="Learn more about the platform"
          onPress={() => {}}
        />
        
        <SettingItem 
          icon="📚"
          title="Help & Support"
          subtitle="Get help and tutorials"
          onPress={() => {}}
        />
        
        <SettingItem 
          icon="⚖️"
          title="Terms & Privacy"
          subtitle="Read our policies"
          onPress={() => {}}
        />
      </View>
      
      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>PrivateAlpha v1.0.0</Text>
        <Text style={styles.versionSubtext}>Powered by iExec & Arbitrum</Text>
      </View>
      
      {/* Disconnect Button */}
      <TouchableOpacity style={styles.disconnectButton}>
        <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function SettingItem({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );
}

function SettingToggle({ icon, title, subtitle, value, onValueChange }) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch 
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3a3a4e', true: '#00d4aa' }}
        thumbColor={value ? '#fff' : '#8e8e93'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingBottom: 80,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#252545',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e8e93',
    marginLeft: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 2,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
  },
  settingArrow: {
    fontSize: 24,
    color: '#8e8e93',
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#8e8e93',
  },
  disconnectButton: {
    backgroundColor: '#ff3b30',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomPadding: {
    height: 32,
  },
});
