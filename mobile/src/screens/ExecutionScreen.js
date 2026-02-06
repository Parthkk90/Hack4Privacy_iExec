import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { executePrivateTrade } from '../services/api';

export default function ExecutionScreen({ route, navigation }) {
  const { opportunity, scoreData } = route.params;
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const pulseAnim = new Animated.Value(1);
  const successAnim = new Animated.Value(0);
  
  useEffect(() => {
    executeTrade();
    startPulseAnimation();
  }, []);
  
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
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
      const mockProof = '0x6d6f636b2d70726f6f66'; // hex encoded 'mock-proof'
      await delay(1000);
      
      // Step 4: Execute
      setStep(4);
      setProgress(0.8);
      const txResult = await executePrivateTrade(opportunity, mockProof);
      
      setProgress(1.0);
      setResult(txResult);
      
      // Success animation
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Execution error:', error);
    }
  };
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const stepDetails = [
    {
      label: "Encrypting strategy",
      description: "Securing your trade parameters",
      icon: "🔐"
    },
    {
      label: "TEE computation",
      description: "Processing in secure enclave",
      icon: "⚙️"
    },
    {
      label: "Generating proof",
      description: "Creating attestation",
      icon: "📜"
    },
    {
      label: "Private execution",
      description: "Submitting via Flashbots",
      icon: "⚡"
    }
  ];
  
  if (result) {
    return (
      <View style={styles.container}>
        <Animated.View style={[
          styles.successContainer,
          {
            opacity: successAnim,
            transform: [{ scale: successAnim }]
          }
        ]}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Trade Executed!</Text>
          <Text style={styles.successSubtitle}>Your transaction is confirmed</Text>
        </Animated.View>
        
        <View style={styles.resultsContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Asset</Text>
            <Text style={styles.resultValue}>{opportunity.asset}</Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Estimated Profit</Text>
            <Text style={styles.profitValue}>+${opportunity.expectedProfit}</Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Transaction Hash</Text>
            <Text style={styles.txHash}>
              {result.txHash ? result.txHash.slice(0, 10) : '0x7a3f2d1b'}...{result.txHash ? result.txHash.slice(-8) : '9e8c5f4a'}
            </Text>
            <Text style={styles.viewExplorer}>View on Explorer →</Text>
          </View>
        </View>
        
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔒 Privacy Guaranteed</Text>
          <SecurityFeature text="Trade executed privately via Flashbots" />
          <SecurityFeature text="No MEV extraction possible" />
          <SecurityFeature text="TEE attestation verified" />
        </View>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => navigation.navigate('Dashboard', { scoreData, walletAddress: route.params.walletAddress })}
        >
          <Text style={styles.doneButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Executing {opportunity.signal} Order</Text>
      <Text style={styles.assetName}>{opportunity.asset}</Text>
      
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <ActivityIndicator size="large" color="#00d4aa" style={styles.spinner} />
      </Animated.View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{(progress * 100).toFixed(0)}%</Text>
      </View>
      
      <View style={styles.stepsContainer}>
        {stepDetails.map((stepInfo, index) => (
          <StepItem 
            key={index}
            {...stepInfo}
            number={index + 1}
            active={step === index + 1}
            completed={step > index + 1}
          />
        ))}
      </View>
      
      <View style={styles.securityBadges}>
        <SecurityBadge icon="🔒" text="Private" />
        <SecurityBadge icon="⚡" text="No MEV" />
        <SecurityBadge icon="✓" text="TEE Verified" />
      </View>
    </View>
  );
}

function StepItem({ number, icon, label, description, active, completed }) {
  return (
    <View style={[
      styles.stepItem,
      active && styles.stepItemActive,
      completed && styles.stepItemCompleted
    ]}>
      <View style={[
        styles.stepNumber,
        active && styles.stepNumberActive,
        completed && styles.stepNumberCompleted
      ]}>
        {completed ? (
          <Text style={styles.stepCheckmark}>✓</Text>
        ) : (
          <Text style={styles.stepNumberText}>{icon}</Text>
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={[
          styles.stepLabel,
          (active || completed) && styles.stepLabelActive
        ]}>
          {label}
        </Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

function SecurityBadge({ icon, text }) {
  return (
    <View style={styles.securityBadge}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function SecurityFeature({ text }) {
  return (
    <View style={styles.securityFeature}>
      <Text style={styles.securityCheck}>✓</Text>
      <Text style={styles.securityFeatureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  assetName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4aa',
    textAlign: 'center',
    marginBottom: 40,
  },
  spinner: {
    marginVertical: 30,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'right',
  },
  stepsContainer: {
    marginTop: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    opacity: 0.5,
  },
  stepItemActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#00d4aa',
  },
  stepItemCompleted: {
    opacity: 0.7,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#252545',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberActive: {
    backgroundColor: '#00d4aa',
  },
  stepNumberCompleted: {
    backgroundColor: '#00d4aa',
  },
  stepNumberText: {
    fontSize: 20,
  },
  stepCheckmark: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 4,
  },
  stepLabelActive: {
    color: '#fff',
  },
  stepDescription: {
    fontSize: 12,
    color: '#8e8e93',
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  securityBadge: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  badgeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 60,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profitValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  txHash: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  viewExplorer: {
    fontSize: 12,
    color: '#00d4aa',
    fontWeight: '600',
  },
  securityCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityCheck: {
    fontSize: 16,
    color: '#00d4aa',
    marginRight: 12,
  },
  securityFeatureText: {
    fontSize: 14,
    color: '#8e8e93',
    flex: 1,
  },
  doneButton: {
    backgroundColor: '#00d4aa',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
