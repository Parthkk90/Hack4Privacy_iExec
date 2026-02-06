import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { computeCreditScore } from '../services/api';

const CreditScoreScreen = ({ route, navigation }) => {
  const { address } = route.params;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const computeScore = async () => {
      try {
        // Step 1: Submit to TEE
        setStatus('Submitting to TEE...');
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Computing
        setStatus('Computing in secure enclave...');
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Generating attestation
        setStatus('Generating attestation...');
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Complete
        setStatus('Complete!');
        setProgress(100);

        // Mock result
        const result = {
          score: 720,
          tier: 3,
          maxLeverage: 2.25,
        };

        setTimeout(() => {
          navigation.replace('Dashboard', { address, creditScore: result });
        }, 1000);
      } catch (error) {
        setStatus('Error: ' + error.message);
      }
    };

    computeScore();
  }, [address, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Computing Credit Score</Text>
      <Text style={styles.address}>{address.slice(0, 6)}...{address.slice(-4)}</Text>
      
      <View style={styles.progressContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.progress}>{progress}%</Text>
      </View>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.info}>
        <Text style={styles.infoText}>🔒 Computation happening in TEE</Text>
        <Text style={styles.infoText}>🛡️ Your data remains private</Text>
        <Text style={styles.infoText}>✨ Generating cryptographic proof</Text>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  address: {
    color: '#888',
    fontSize: 14,
    marginBottom: 40,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progress: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },
  status: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 40,
  },
  info: {
    marginTop: 20,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    marginVertical: 5,
  },
});

export default CreditScoreScreen;
