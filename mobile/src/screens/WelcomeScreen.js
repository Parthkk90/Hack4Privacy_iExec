import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const glowAnim = new Animated.Value(0);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const handleWalletConnected = async (address) => {
    setWalletAddress(address);
    
    try {
      await AsyncStorage.setItem('walletAddress', address);
      console.log('Wallet address saved to storage:', address);
    } catch (error) {
      console.error('Failed to save wallet address:', error);
    }
    
    setTimeout(() => {
      navigation.navigate('Dashboard', { walletAddress: address });
    }, 800);
  };
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <Animated.View 
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            {/* Glow effect */}
            <Animated.View style={[styles.logoGlow, { opacity: glowOpacity }]} />
            <View style={styles.shieldBadge}>
              <Ionicons name="shield-checkmark" size={48} color="#F59E0B" />
            </View>
          </View>
          <Text style={styles.title}>PUREIS </Text>
          <Text style={styles.subtitle}>Trade Smarter, Not Harder</Text>
        </Animated.View>
        
        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <FeatureCard 
            icon="shield-check"
            title="TEE-Protected"
            subtitle="Secured by iExec TEE technology for total privacy."
            delay={200}
          />
          <FeatureCard 
            icon="bank"
            title="On-Chain Credit"
            subtitle="Unlock capital efficiency with decentralized scores."
            delay={400}
          />
          <FeatureCard 
            icon="shield-alert"
            title="MEV Protection"
            subtitle="Advanced AI signals to shield your trades from bots."
            delay={600}
          />
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          {!walletAddress ? (
            <>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={() => {
                  const testAddress = '0xBf8E022195f387dB0C28C741d1A7b1BeD1144B3C';
                  handleWalletConnected(testAddress);
                }}
              >
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              </TouchableOpacity>
              
              <View style={styles.networkBadge}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>ARBITRUM SEPOLIA</Text>
              </View>
              
              <Text style={styles.termsText}>
                By connecting, you agree to our Terms of Service and Privacy Policy.
              </Text>
            </>
          ) : (
            <View style={styles.connectedInfo}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.connectedText}>Wallet Connected</Text>
              <Text style={styles.addressText}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, subtitle, delay }) {
  const fadeIn = new Animated.Value(0);
  const slideUp = new Animated.Value(30);
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        delay: delay || 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        delay: delay || 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const getIconColor = () => {
    if (icon === 'shield-check') return '#3B82F6';
    if (icon === 'bank') return '#8B5CF6';
    return '#10B981';
  };
  
  const getIconBg = () => {
    if (icon === 'shield-check') return 'rgba(59, 130, 246, 0.1)';
    if (icon === 'bank') return 'rgba(139, 92, 246, 0.1)';
    return 'rgba(16, 185, 129, 0.1)';
  };
  
  return (
    <Animated.View 
      style={[
        styles.featureCard, 
        { 
          opacity: fadeIn,
          transform: [{ translateY: slideUp }]
        }
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: getIconBg() }]}>
        <MaterialCommunityIcons name={icon} size={28} color={getIconColor()} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F59E0B',
    opacity: 0.3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  shieldBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 60,
  },
  featureCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    gap: 20,
  },
  connectButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  connectButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  networkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  connectedInfo: {
    alignItems: 'center',
    gap: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});
