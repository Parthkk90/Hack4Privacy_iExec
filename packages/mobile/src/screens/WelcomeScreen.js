import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  const handleConnect = () => {
    // Mock wallet connection for now
    navigation.navigate('CreditScore', { address: '0x1234567890123456789012345678901234567890' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PUREIS </Text>
      <Text style={styles.subtitle}>Private DeFi Trading Platform</Text>
      
      <View style={styles.features}>
        <Text style={styles.feature}>🔒 Private Credit Scoring</Text>
        <Text style={styles.feature}>📊 AI-Powered Signals</Text>
        <Text style={styles.feature}>⚡ MEV Protection</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>Connect Wallet</Text>
      </TouchableOpacity>

      <Text style={styles.network}>Arbitrum Sepolia Testnet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 50,
  },
  features: {
    marginBottom: 50,
  },
  feature: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  network: {
    color: '#666',
    fontSize: 14,
  },
});

export default WelcomeScreen;
