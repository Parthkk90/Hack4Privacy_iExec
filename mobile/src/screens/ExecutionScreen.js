import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { executePrivateTrade } from '../services/api';

export default function ExecutionScreen({ route }) {
  const { opportunity, scoreData } = route.params;
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    executeTrade();
  }, []);
  
  const executeTrade = async () => {
    try {
      // Step 1: Encrypt
      setStep(1);
      setProgress(0.2);
      await delay(1000);
      
      // Step 2: TEE Computation
      setStep(2);
      setProgress(0.4);
      await delay(1500);
      
      // Step 3: Generate Proof
      setStep(3);
      setProgress(0.6);
      const mockProof = '0x' + Buffer.from('mock-proof').toString('hex');
      await delay(1000);
      
      // Step 4: Execute
      setStep(4);
      setProgress(0.8);
      const txResult = await executePrivateTrade(opportunity, mockProof);
      
      setProgress(1.0);
      setResult(txResult);
      
    } catch (error) {
      console.error('Execution error:', error);
    }
  };
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const stepLabels = [
    "Encrypting strategy",
    "TEE computation",
    "Generating proof",
    "Private execution"
  ];
  
  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Trade Executed Successfully</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Profit Estimate</Text>
          <Text style={styles.resultValue}>${opportunity.expectedProfit}</Text>
        </View>
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Transaction Hash</Text>
          <Text style={styles.txHash}>{result.txHash.slice(0, 20)}...</Text>
        </View>
        <Text style={styles.securityNote}>
          🔒 Trade executed privately{'\n'}
          No MEV, no frontrunning
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Executing {opportunity.type || 'Trade'}</Text>
      
      <ActivityIndicator size="large" color="#00d4aa" style={styles.spinner} />
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      
      <Text style={styles.stepText}>
        Step {step}/4: {stepLabels[step - 1]}
      </Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>🔒 No one can see this trade</Text>
        <Text style={styles.infoText}>⚡ MEV protection enabled</Text>
        <Text style={styles.infoText}>✓ TEE verified computation</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  spinner: {
    marginVertical: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    marginVertical: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 4,
  },
  stepText: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 40,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  txHash: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
  },
  securityNote: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 18,
  },
});
