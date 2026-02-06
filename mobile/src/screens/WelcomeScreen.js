import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import WalletConnector from '../components/WalletConnector';

export default function WelcomeScreen({ navigation }) {
  const [walletAddress, setWalletAddress] = useState(null);
  
  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    // Navigate to credit score screen
    navigation.navigate('CreditScore', { walletAddress: address });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🔒</Text>
        <Text style={styles.title}>PrivateAlpha</Text>
        <Text style={styles.subtitle}>
          Trade smarter, not harder.{'\n'}
          Your strategies stay private. Always.
        </Text>
      </View>
      
      <View style={styles.features}>
        <FeatureItem icon="🎯" text="AI-powered trading signals" />
        <FeatureItem icon="🔐" text="TEE-protected computation" />
        <FeatureItem icon="⚡" text="MEV-resistant execution" />
        <FeatureItem icon="💳" text="On-chain credit scoring" />
      </View>
      
      <View style={styles.connectionSection}>
        {!walletAddress ? (
          <WalletConnector onConnected={handleWalletConnected} />
        ) : (
          <View style={styles.connectedInfo}>
            <Text style={styles.connectedText}>Connected</Text>
            <Text style={styles.addressText}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by iExec & Arbitrum</Text>
        <Text style={styles.networkText}>🌐 Arbitrum Sepolia</Text>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  connectionSection: {
    marginBottom: 40,
  },
  connectedInfo: {
    backgroundColor: '#00d4aa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
  },
  networkText: {
    fontSize: 12,
    color: '#00d4aa',
    fontWeight: 'bold',
  },
});
