import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WalletConnector({ onConnected }) {
  const [connecting, setConnecting] = useState(false);
  
  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      // In production, integrate WalletConnect:
      // 1. Initialize WalletConnect
      // 2. Request connection
      // 3. Get user's address
      
      // For development: use mock address
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      onConnected(mockAddress);
      
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleConnect}
        disabled={connecting}
      >
        <Text style={styles.buttonText}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.supportedText}>
        Supports MetaMask, WalletConnect, Coinbase Wallet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#00d4aa',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  supportedText: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
