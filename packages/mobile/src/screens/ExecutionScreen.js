import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { executeTrade } from '../services/api';

const ExecutionScreen = ({ route, navigation }) => {
  const { opportunity } = route.params;
  const [status, setStatus] = useState('ready');
  const [txId, setTxId] = useState(null);

  const handleExecute = async () => {
    setStatus('executing');
    
    try {
      const result = await executeTrade({
        userAddress: '0x1234567890123456789012345678901234567890',
        symbol: opportunity.symbol,
        amount: opportunity.positionSize,
        signal: opportunity.signal,
      });

      setTxId(result.transactionId);
      setStatus('success');

      setTimeout(() => {
        navigation.navigate('Dashboard');
      }, 3000);
    } catch (error) {
      setStatus('error');
      console.error('Trade execution error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Execute Trade</Text>

      <View style={styles.card}>
        <Text style={styles.symbol}>{opportunity.symbol}</Text>
        <Text style={styles.signal}>{opportunity.signal}</Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Entry Price</Text>
            <Text style={styles.detailValue}>${opportunity.currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Position Size</Text>
            <Text style={styles.detailValue}>
              {(opportunity.positionSize * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Leverage</Text>
            <Text style={styles.detailValue}>{opportunity.leverage}x</Text>
          </View>
        </View>
      </View>

      {status === 'ready' && (
        <View>
          <View style={styles.protectionBadge}>
            <Text style={styles.protectionText}>🛡️ MEV Protected</Text>
            <Text style={styles.protectionSubtext}>
              Transaction will be encrypted until execution
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleExecute}>
            <Text style={styles.buttonText}>Confirm & Execute</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'executing' && (
        <View style={styles.status}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.statusText}>Submitting to MEV-protected relayer...</Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.status}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.statusText}>Trade Submitted Successfully!</Text>
          <Text style={styles.txId}>TX: {txId}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.status}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.statusText}>Trade execution failed</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleExecute}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  symbol: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signal: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  details: {
    width: '100%',
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  protectionBadge: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  protectionText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  protectionSubtext: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    alignItems: 'center',
    marginTop: 30,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
  },
  errorIcon: {
    fontSize: 64,
  },
  txId: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExecutionScreen;
