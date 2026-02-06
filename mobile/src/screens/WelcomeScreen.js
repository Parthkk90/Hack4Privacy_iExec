import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import WalletConnector from '../components/WalletConnector';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    // Navigate to credit score screen after brief delay
    setTimeout(() => {
      navigation.navigate('CreditScore', { walletAddress: address });
    }, 1000);
  };
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🔒</Text>
          <View style={styles.logoGlow} />
        </View>
        <Text style={styles.title}>PrivateAlpha</Text>
        <Text style={styles.subtitle}>
          Trade smarter, not harder.{'\n'}
          Your strategies stay private. Always.
        </Text>
        <View style={styles.statsRow}>
          <StatBadge number="1,247" label="Trades Protected" />
          <StatBadge number="$2.4M" label="MEV Saved" />
        </View>
      </Animated.View>
      
      <View style={styles.features}>
        <FeatureItem icon="🎯" text="AI-powered trading signals" delay={200} />
        <FeatureItem icon="🔐" text="TEE-protected computation" delay={300} />
        <FeatureItem icon="⚡" text="MEV-resistant execution" delay={400} />
        <FeatureItem icon="💳" text="On-chain credit scoring" delay={500} />
      </View>
      
      <View style={styles.connectionSection}>
        {!walletAddress ? (
          <WalletConnector onConnected={handleWalletConnected} />
        ) : (
          <Animated.View style={styles.connectedInfo}>
            <Text style={styles.connectedText}>✓ Wallet Connected</Text>
            <Text style={styles.addressText}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Text>
            <Text style={styles.proceedingText}>Proceeding to analysis...</Text>
          </Animated.View>
        )}
      </View>
      
      <View style={styles.footer}>
        <View style={styles.poweredBy}>
          <Text style={styles.footerText}>Powered by</Text>
          <View style={styles.partnerLogos}>
            <Text style={styles.partnerText}>iExec</Text>
            <Text style={styles.divider}>•</Text>
            <Text style={styles.partnerText}>Arbitrum</Text>
          </View>
        </View>
        <View style={styles.networkBadge}>
          <View style={styles.networkDot} />
          <Text style={styles.networkText}>Arbitrum Sepolia</Text>
        </View>
      </View>
    </View>
  );
}

function StatBadge({ number, label }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FeatureItem({ icon, text, delay }) {
  const fadeIn = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      delay: delay || 0,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View style={[styles.featureItem, { opacity: fadeIn }]}>
      <View style={styles.featureIconContainer}>
        <Text style={styles.featureIcon}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
      <Text style={styles.checkmark}>✓</Text>
    </Animated.View>
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
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 80,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#00d4aa',
    opacity: 0.1,
    borderRadius: 50,
    top: -10,
    left: -10,
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
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBadge: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4aa',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  statLabel: {
    fontSize: 10,
    color: '#8e8e93',
    marginTop: 2,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252545',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252545',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    color: '#00d4aa',
  },
  connectionSection: {
    marginBottom: 40,
  },
  connectedInfo: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4aa',
  },
  connectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  proceedingText: {
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  poweredBy: {
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#8e8e93',
    marginBottom: 4,
  },
  partnerLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    color: '#8e8e93',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4aa',
  },
  networkText: {
    fontSize: 12,
    color: '#00d4aa',
    fontWeight: '600',
  },
});
