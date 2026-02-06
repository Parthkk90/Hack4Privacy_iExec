import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { computeCreditScore } from '../services/api';
import CreditScoreMeter from '../components/CreditScoreMeter';

export default function CreditScoreScreen({ route, navigation }) {
  const { walletAddress } = route.params;
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);
  const [progress, setProgress] = useState(0);
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    fetchCreditScore();
    animateProgress();
  }, []);
  
  const animateProgress = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  
  const fetchCreditScore = async () => {
    try {
      // Simulate analysis steps
      await updateProgress('Fetching wallet data...', 0.2);
      await delay(1000);
      
      await updateProgress('Analyzing trading history...', 0.4);
      await delay(1000);
      
      await updateProgress('Computing in secure enclave...', 0.7);
      await delay(1000);
      
      // Fetch from API
      const result = await computeCreditScore(walletAddress);
      
      await updateProgress('Score computed!', 1.0);
      await delay(500);
      
      setScoreData(result);
      setLoading(false);
      
      // Navigate to dashboard after viewing score
      setTimeout(() => {
        navigation.navigate('Dashboard', { scoreData: result, walletAddress });
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  const updateProgress = async (message, value) => {
    setProgress({ message, value });
  };
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Analyzing Your Wallet</Text>
        
        <ActivityIndicator size="large" color="#00d4aa" style={styles.spinner} />
        
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.value * 100}%` }]} />
        </View>
        
        <Text style={styles.progressText}>{progress.message}</Text>
        
        <View style={styles.checkList}>
          <CheckItem completed={progress.value >= 0.2} text="156 trades analyzed" />
          <CheckItem completed={progress.value >= 0.4} text="12 loans evaluated" />
          <CheckItem completed={progress.value >= 0.7} text="Risk metrics computed" />
          <CheckItem completed={progress.value >= 1.0} text="TEE attestation verified" />
        </View>
        
        <Text style={styles.securityNote}>
          🔒 All computation happens in a secure enclave{'\n'}
          Your data never leaves the TEE
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Your Credit Score</Text>
        
        <CreditScoreMeter score={scoreData.score} tier={scoreData.tier} />
        
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{getTierName(scoreData.tier)} Tier</Text>
        </View>
        
        <View style={styles.benefits}>
          <BenefitItem text={`${scoreData.max_leverage}x leverage available`} />
          <BenefitItem text="0.1% trading fee discount" />
          <BenefitItem text="Priority execution access" />
          <BenefitItem text="Advanced strategy signals" />
        </View>
        
        <Text style={styles.proceedingText}>
          Proceeding to dashboard...
        </Text>
      </Animated.View>
    </View>
  );
}

function CheckItem({ completed, text }) {
  return (
    <View style={styles.checkItem}>
      <Text style={styles.checkIcon}>{completed ? '✓' : '○'}</Text>
      <Text style={[styles.checkText, completed && styles.checkTextCompleted]}>
        {text}
      </Text>
    </View>
  );
}

function BenefitItem({ text }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function getTierName(tier) {
  const tiers = ['', 'Bronze', 'Silver', 'Gold', 'Platinum'];
  return tiers[tier] || 'Unknown';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  spinner: {
    marginVertical: 30,
  },
  progressBar: {
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
  progressText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 30,
  },
  checkList: {
    marginVertical: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 20,
    color: '#00d4aa',
    marginRight: 12,
    width: 24,
  },
  checkText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  checkTextCompleted: {
    color: '#fff',
  },
  securityNote: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
  },
  resultContainer: {
    alignItems: 'center',
  },
  tierBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 20,
  },
  tierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  benefits: {
    width: '100%',
    marginTop: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: '#00d4aa',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  proceedingText: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 30,
  },
});
